import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

const IslamicCalendar = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [hijriDate, setHijriDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get current Hijri date
  const { data: currentHijriDate } = useQuery({
    queryKey: ['hijriDate'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/hijri-date');
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Get Islamic events
  const { data: islamicEvents } = useQuery({
    queryKey: ['islamicEvents', hijriDate?.hijri?.year],
    queryFn: async () => {
      if (!hijriDate?.hijri?.year) return [];
      const response = await apiRequest('GET', `/api/islamic-events?year=${hijriDate.hijri.year}`);
      return response.json();
    },
    enabled: !!hijriDate?.hijri?.year,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Get events for this month
  const { data: monthEvents } = useQuery({
    queryKey: ['monthEvents', currentMonth],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/events/month/${currentMonth}`);
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Set Hijri date from current date data
  useEffect(() => {
    if (currentHijriDate) {
      setHijriDate(currentHijriDate);
    }
  }, [currentHijriDate]);

  // Function to get Islamic month name
  const getIslamicMonthName = (monthNumber) => {
    const months = [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    return months[monthNumber - 1];
  };

  // Function to generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day opacity-0"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      // Check if this day has an event
      const hasEvent = monthEvents && monthEvents.some(event => {
        const eventDate = new Date(event.gregorianDate);
        return eventDate.getDate() === day;
      });
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day cursor-pointer ${isToday ? 'calendar-day-current' : ''} ${isSelected ? 'bg-accent text-white' : ''} ${hasEvent ? 'calendar-day-event' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // Handle previous month
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Handle next month
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
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

  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 text-primary">Islamic Calendar</h2>
      
      {hijriDate && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Current Hijri Date:</strong> {hijriDate.hijri.day} {hijriDate.hijri.month.en} {hijriDate.hijri.year} AH<br />
            <strong>Current Gregorian Date:</strong> {hijriDate.gregorian.day} {hijriDate.gregorian.month.en} {hijriDate.gregorian.year}
          </p>
        </div>
      )}

      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg font-medium">
          {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {generateCalendarDays()}
      </div>

      {/* Selected date events */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">
          Events on {selectedDate.toLocaleDateString()}
        </h3>
        
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="bg-gray-100 p-3 rounded-lg">
                <h4 className="font-medium text-primary">{event.title}</h4>
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No events for this date.</p>
        )}
      </div>

      {/* Upcoming Islamic events */}
      {islamicEvents && islamicEvents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Upcoming Islamic Events</h3>
          <div className="space-y-2">
            {islamicEvents.slice(0, 3).map((event, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-lg">
                <h4 className="font-medium text-primary">{event.name}</h4>
                <p className="text-sm text-gray-600">
                  {event.date} ({event.date.split('-')[0]} {getIslamicMonthName(parseInt(event.date.split('-')[1]))} {event.date.split('-')[2]})
                </p>
                <p className="text-sm text-gray-700 mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IslamicCalendar;
