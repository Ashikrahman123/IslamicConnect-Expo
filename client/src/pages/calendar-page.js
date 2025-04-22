import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import Navbar from '../components/navbar';

const CalendarPage = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentHijriYear, setCurrentHijriYear] = useState(null);
  const [currentHijriMonth, setCurrentHijriMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('gregorian'); // 'gregorian' or 'hijri'

  // Get current Hijri date
  const { data: currentHijriDate } = useQuery({
    queryKey: ['hijriDate'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/hijri-date');
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Set Hijri date from current date data
  useEffect(() => {
    if (currentHijriDate) {
      setCurrentHijriYear(currentHijriDate.hijri.year);
      setCurrentHijriMonth(currentHijriDate.hijri.month.number);
    }
  }, [currentHijriDate]);

  // Get Hijri calendar for current month
  const { data: hijriCalendar, isLoading: isLoadingHijriCalendar } = useQuery({
    queryKey: ['hijriCalendar', currentHijriYear, currentHijriMonth],
    queryFn: async () => {
      if (!currentHijriYear || !currentHijriMonth) return null;
      const response = await apiRequest('GET', `/api/hijri-calendar?year=${currentHijriYear}&month=${currentHijriMonth}`);
      return response.json();
    },
    enabled: !!currentHijriYear && !!currentHijriMonth && viewMode === 'hijri',
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Get Islamic events for the year
  const { data: islamicEvents } = useQuery({
    queryKey: ['islamicEvents', currentHijriYear],
    queryFn: async () => {
      if (!currentHijriYear) return [];
      const response = await apiRequest('GET', `/api/islamic-events?year=${currentHijriYear}`);
      return response.json();
    },
    enabled: !!currentHijriYear,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Get events for the month
  const { data: monthEvents } = useQuery({
    queryKey: ['monthEvents', viewMode === 'gregorian' ? currentMonth : currentHijriMonth],
    queryFn: async () => {
      const monthNumber = viewMode === 'gregorian' ? currentMonth : currentHijriMonth;
      const response = await apiRequest('GET', `/api/events/month/${monthNumber}`);
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Function to get Islamic month name
  const getIslamicMonthName = (monthNumber) => {
    const months = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    return months[monthNumber - 1];
  };

  // Function to generate Gregorian calendar days
  const generateGregorianCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day opacity-0"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const isToday = 
        date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      // Check if this day has an event
      const hasEvent = monthEvents && monthEvents.some(event => {
        const eventDate = new Date(event.gregorianDate);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      });
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day cursor-pointer hover:bg-gray-100 ${isToday ? 'calendar-day-current' : ''} ${isSelected ? 'bg-accent text-white' : ''} ${hasEvent ? 'calendar-day-event' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // Function to generate Hijri calendar days
  const generateHijriCalendarDays = () => {
    if (!hijriCalendar || !hijriCalendar.length) return [];

    const days = [];
    const today = currentHijriDate?.hijri?.day;
    
    // Determine first day of the month to offset the calendar correctly
    const firstDayOfMonth = new Date(hijriCalendar[0].gregorian.date).getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day opacity-0"></div>);
    }

    // Add days of the month
    hijriCalendar.forEach((day, index) => {
      const hijriDay = parseInt(day.hijri.day);
      const isToday = hijriDay === parseInt(today) && 
                     day.hijri.month.number === currentHijriDate?.hijri?.month.number && 
                     day.hijri.year === currentHijriDate?.hijri?.year;
      
      // Check if this day has an event
      const hasEvent = islamicEvents && islamicEvents.some(event => {
        const [eventDay, eventMonth] = event.date.split('-').map(Number);
        return eventDay === hijriDay && eventMonth === parseInt(day.hijri.month.number);
      });
      
      days.push(
        <div 
          key={`day-${index}`} 
          className={`calendar-day cursor-pointer hover:bg-gray-100 ${isToday ? 'calendar-day-current' : ''} ${hasEvent ? 'calendar-day-event' : ''}`}
          onClick={() => {
            // Convert Hijri date to Gregorian for consistency
            setSelectedDate(new Date(day.gregorian.date));
          }}
        >
          {hijriDay}
        </div>
      );
    });

    return days;
  };

  // Function to handle previous month
  const handlePrevMonth = () => {
    if (viewMode === 'gregorian') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentHijriMonth === 1) {
        setCurrentHijriMonth(12);
        setCurrentHijriYear(currentHijriYear - 1);
      } else {
        setCurrentHijriMonth(currentHijriMonth - 1);
      }
    }
  };

  // Function to handle next month
  const handleNextMonth = () => {
    if (viewMode === 'gregorian') {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentHijriMonth === 12) {
        setCurrentHijriMonth(1);
        setCurrentHijriYear(currentHijriYear + 1);
      } else {
        setCurrentHijriMonth(currentHijriMonth + 1);
      }
    }
  };

  // Get events for selected date
  const getEventsForSelectedDate = () => {
    if (!monthEvents) return [];
    
    return monthEvents.filter(event => {
      const eventDate = new Date(event.gregorianDate);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  };

  // Find Islamic events for a specific Hijri date
  const getIslamicEventsForDate = (hijriDay, hijriMonth) => {
    if (!islamicEvents) return [];
    
    return islamicEvents.filter(event => {
      const [eventDay, eventMonth] = event.date.split('-').map(Number);
      return eventDay === hijriDay && eventMonth === hijriMonth;
    });
  };

  // Get all events for selected date from both calendar systems
  const selectedDateEvents = getEventsForSelectedDate();
  
  // Get corresponding Hijri date for the selected Gregorian date
  const { data: selectedHijriDate } = useQuery({
    queryKey: ['selectedHijriDate', selectedDate.toISOString()],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/hijri-date?date=${selectedDate.toISOString()}`);
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  // Get Islamic events for the selected Hijri date
  const selectedIslamicEvents = selectedHijriDate ? 
    getIslamicEventsForDate(
      parseInt(selectedHijriDate.hijri.day), 
      selectedHijriDate.hijri.month.number
    ) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Islamic Calendar</h1>
        
        {/* Calendar Display Options */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary mb-4 sm:mb-0">Calendar View</h2>
            
            <div className="flex items-center">
              <span className="mr-2 text-gray-700">View:</span>
              <button 
                onClick={() => setViewMode('gregorian')}
                className={`px-4 py-2 rounded-l-md ${viewMode === 'gregorian' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Gregorian
              </button>
              <button 
                onClick={() => setViewMode('hijri')}
                className={`px-4 py-2 rounded-r-md ${viewMode === 'hijri' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Hijri
              </button>
            </div>
          </div>
          
          {currentHijriDate && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-center">
                <span className="font-medium">Today's Date:</span>
                <span className="ml-2">
                  {currentHijriDate.gregorian.day} {currentHijriDate.gregorian.month.en} {currentHijriDate.gregorian.year} / 
                  {currentHijriDate.hijri.day} {currentHijriDate.hijri.month.en} {currentHijriDate.hijri.year}
                </span>
              </p>
            </div>
          )}
        </div>
        
        {/* Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="md:col-span-2">
            <div className="card">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h3 className="text-xl font-medium">
                  {viewMode === 'gregorian' 
                    ? `${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} ${currentYear}`
                    : `${getIslamicMonthName(currentHijriMonth)} ${currentHijriYear}`
                  }
                </h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                <div className="font-medium text-sm">Su</div>
                <div className="font-medium text-sm">Mo</div>
                <div className="font-medium text-sm">Tu</div>
                <div className="font-medium text-sm">We</div>
                <div className="font-medium text-sm">Th</div>
                <div className="font-medium text-sm">Fr</div>
                <div className="font-medium text-sm">Sa</div>
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {viewMode === 'gregorian' 
                  ? generateGregorianCalendarDays()
                  : isLoadingHijriCalendar 
                    ? Array(7).fill(0).map((_, i) => (
                        <div key={`loading-${i}`} className="calendar-day bg-gray-100 animate-pulse"></div>
                      ))
                    : generateHijriCalendarDays()
                }
              </div>

              <div className="mt-4 flex flex-wrap">
                <div className="flex items-center mr-6 mb-2">
                  <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
                  <span className="text-sm">Today</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <div className="w-4 h-4 border-2 border-accent rounded-full mr-2"></div>
                  <span className="text-sm">Islamic Event</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-accent rounded-full mr-2"></div>
                  <span className="text-sm">Selected Date</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Details */}
          <div className="md:col-span-1">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">
                Events on {selectedDate.toLocaleDateString()}
                {selectedHijriDate && (
                  <span className="block text-sm text-gray-600 mt-1">
                    {selectedHijriDate.hijri.day} {selectedHijriDate.hijri.month.en} {selectedHijriDate.hijri.year}
                  </span>
                )}
              </h3>
              
              {/* Community Events */}
              {selectedDateEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-primary">Community Events</h4>
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="bg-gray-100 p-3 rounded-lg">
                        <h5 className="font-medium">{event.title}</h5>
                        <p className="text-sm text-gray-700">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Islamic Events */}
              {selectedIslamicEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-primary">Islamic Events</h4>
                  <div className="space-y-2">
                    {selectedIslamicEvents.map((event, index) => (
                      <div key={index} className="bg-primary bg-opacity-10 p-3 rounded-lg">
                        <h5 className="font-medium text-primary">{event.name}</h5>
                        <p className="text-sm text-gray-700">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDateEvents.length === 0 && selectedIslamicEvents.length === 0 && (
                <p className="text-gray-500">No events for this date.</p>
              )}
              
              {/* Upcoming Islamic Events */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Upcoming Islamic Events</h3>
                {islamicEvents && islamicEvents.length > 0 ? (
                  <div className="space-y-2">
                    {islamicEvents.slice(0, 3).map((event, index) => (
                      <div key={index} className="bg-gray-100 p-3 rounded-lg">
                        <h4 className="font-medium text-primary">{event.name}</h4>
                        <p className="text-sm text-gray-600">
                          {event.date.split('-')[0]} {getIslamicMonthName(parseInt(event.date.split('-')[1]))} {event.date.split('-')[2]}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming events.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-primary text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Islamic Community App</p>
          <p className="text-sm mt-2">Designed and developed with ❤️ for the Muslim community</p>
        </div>
      </footer>
    </div>
  );
};

export default CalendarPage;
