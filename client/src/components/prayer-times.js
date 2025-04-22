import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

const PrayerTimes = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [useCoordinates, setUseCoordinates] = useState(true);

  // Get user's current location
  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Unable to get your location. Please enter your city manually.',
            type: 'error'
          });
          setIsLocating(false);
          setUseCoordinates(false);
        }
      );
    } else {
      toast({
        title: 'Location Not Supported',
        description: 'Geolocation is not supported by your browser. Please enter your city manually.',
        type: 'error'
      });
      setIsLocating(false);
      setUseCoordinates(false);
    }
  };

  // Fetch prayer times by coordinates
  const { data: prayerTimesData, isLoading: isLoadingPrayerTimes, error: prayerTimesError } = useQuery({
    queryKey: ['prayerTimes', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) return null;
      
      const response = await apiRequest(
        'GET',
        `/api/prayer-times?latitude=${location.latitude}&longitude=${location.longitude}`
      );
      return response.json();
    },
    enabled: !!location && useCoordinates,
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Fetch prayer times by city
  const { data: cityPrayerTimesData, isLoading: isLoadingCityPrayerTimes, error: cityPrayerTimesError } = useQuery({
    queryKey: ['prayerTimesByCity', city, country],
    queryFn: async () => {
      if (!city || !country) return null;
      
      const response = await apiRequest(
        'GET',
        `/api/prayer-times/city?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
      );
      return response.json();
    },
    enabled: !!city && !!country && !useCoordinates,
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Check if a prayer is active based on the current time
  const isActivePrayer = (prayerTime) => {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':');
    const prayerDateTime = new Date();
    prayerDateTime.setHours(parseInt(hours, 10));
    prayerDateTime.setMinutes(parseInt(minutes, 10));
    
    // Get next prayer time
    const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let nextPrayerIndex = -1;
    
    for (let i = 0; i < prayers.length; i++) {
      const [nextHours, nextMinutes] = prayerTimesData[prayers[i]].split(':');
      const nextPrayerDateTime = new Date();
      nextPrayerDateTime.setHours(parseInt(nextHours, 10));
      nextPrayerDateTime.setMinutes(parseInt(nextMinutes, 10));
      
      if (nextPrayerDateTime > now) {
        nextPrayerIndex = i;
        break;
      }
    }
    
    // If this is the next prayer
    if (nextPrayerIndex !== -1 && prayerTimesData[prayers[nextPrayerIndex]] === prayerTime) {
      return true;
    }
    
    return false;
  };

  // Get prayer times data from either source
  const prayerTimes = useCoordinates ? prayerTimesData : cityPrayerTimesData;
  const isLoading = useCoordinates ? isLoadingPrayerTimes : isLoadingCityPrayerTimes;
  const error = useCoordinates ? prayerTimesError : cityPrayerTimesError;

  // Get user location on component mount
  useEffect(() => {
    if (useCoordinates && !location) {
      getUserLocation();
    }
  }, [useCoordinates]);

  // Handle city search form submission
  const handleCitySearch = (e) => {
    e.preventDefault();
    // Re-trigger the query
    setUseCoordinates(false);
  };

  // Handle location switch
  const handleLocationSwitch = () => {
    setUseCoordinates(!useCoordinates);
    if (!useCoordinates && !location) {
      getUserLocation();
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 text-primary">Prayer Times</h2>
      
      {/* Location selector */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={handleLocationSwitch}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${useCoordinates ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span 
              className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${useCoordinates ? 'translate-x-6' : 'translate-x-1'}`} 
            />
          </button>
          <span className="ml-2 text-sm">
            {useCoordinates ? 'Using GPS location' : 'Using city search'}
          </span>
        </div>
        
        {!useCoordinates && (
          <form onSubmit={handleCitySearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="form-label">City</label>
              <input 
                type="text" 
                id="city" 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                className="form-input"
                placeholder="Enter city name"
                required
              />
            </div>
            <div>
              <label htmlFor="country" className="form-label">Country</label>
              <input 
                type="text" 
                id="country" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="form-input"
                placeholder="Enter country name"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary w-full">Get Prayer Times</button>
            </div>
          </form>
        )}
      </div>
      
      {isLocating && (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Getting your location...</span>
        </div>
      )}
      
      {isLoading && !isLocating && (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading prayer times...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading prayer times. Please try again.</p>
        </div>
      )}
      
      {prayerTimes && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {prayerTimes.date?.hijri ? (
                <>
                  <strong>Hijri Date:</strong> {prayerTimes.date.hijri.day} {prayerTimes.date.hijri.month.en} {prayerTimes.date.hijri.year} AH<br />
                  <strong>Gregorian Date:</strong> {prayerTimes.date.gregorian.day} {prayerTimes.date.gregorian.month.en} {prayerTimes.date.gregorian.year}
                </>
              ) : (
                <span>Today's Prayer Times</span>
              )}
            </p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className={`prayer-time ${isActivePrayer(prayerTimes.fajr) ? 'prayer-time-active' : ''}`}>
              <span className="font-medium">Fajr</span>
              <span>{prayerTimes.fajr}</span>
            </div>
            <div className={`prayer-time ${isActivePrayer(prayerTimes.sunrise) ? 'prayer-time-active' : ''}`}>
              <span className="font-medium">Sunrise</span>
              <span>{prayerTimes.sunrise}</span>
            </div>
            <div className={`prayer-time ${isActivePrayer(prayerTimes.dhuhr) ? 'prayer-time-active' : ''}`}>
              <span className="font-medium">Dhuhr</span>
              <span>{prayerTimes.dhuhr}</span>
            </div>
            <div className={`prayer-time ${isActivePrayer(prayerTimes.asr) ? 'prayer-time-active' : ''}`}>
              <span className="font-medium">Asr</span>
              <span>{prayerTimes.asr}</span>
            </div>
            <div className={`prayer-time ${isActivePrayer(prayerTimes.maghrib) ? 'prayer-time-active' : ''}`}>
              <span className="font-medium">Maghrib</span>
              <span>{prayerTimes.maghrib}</span>
            </div>
            <div className={`prayer-time ${isActivePrayer(prayerTimes.isha) ? 'prayer-time-active' : ''}`}>
              <span className="font-medium">Isha</span>
              <span>{prayerTimes.isha}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;
