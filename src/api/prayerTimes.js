import axios from 'axios';
import { PRAYER_TIMES_API } from '../constants/api';

/**
 * Get prayer times for a specific date and location
 * 
 * @param {Date} date - Date for prayer times
 * @param {Number} latitude - Location latitude
 * @param {Number} longitude - Location longitude
 * @param {String} method - Calculation method (default: 'MWL')
 * @returns {Promise<Object>} Prayer times object
 */
export const getPrayerTimes = async (date, latitude, longitude, method = 'MWL') => {
  try {
    const formattedDate = formatDate(date);
    const url = `${PRAYER_TIMES_API}/timings/${formattedDate}`;
    
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        method
      }
    });
    
    return formatPrayerTimesResponse(response.data);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

/**
 * Get prayer times for a specific date by city name
 * 
 * @param {Date} date - Date for prayer times
 * @param {String} city - City name
 * @param {String} country - Country name
 * @param {String} method - Calculation method (default: 'MWL')
 * @returns {Promise<Object>} Prayer times object
 */
export const getPrayerTimesByCity = async (date, city, country, method = 'MWL') => {
  try {
    const formattedDate = formatDate(date);
    const url = `${PRAYER_TIMES_API}/timingsByCity/${formattedDate}`;
    
    const response = await axios.get(url, {
      params: {
        city,
        country,
        method
      }
    });
    
    return formatPrayerTimesResponse(response.data);
  } catch (error) {
    console.error('Error fetching prayer times by city:', error);
    throw error;
  }
};

/**
 * Get prayer times calendar for a month
 * 
 * @param {Number} year - Year
 * @param {Number} month - Month (1-12)
 * @param {Number} latitude - Location latitude
 * @param {Number} longitude - Location longitude
 * @param {String} method - Calculation method (default: 'MWL')
 * @returns {Promise<Array>} Calendar of prayer times
 */
export const getMonthlyPrayerTimes = async (year, month, latitude, longitude, method = 'MWL') => {
  try {
    const url = `${PRAYER_TIMES_API}/calendar/${year}/${month}`;
    
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        method
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching monthly prayer times:', error);
    throw error;
  }
};

/**
 * Format date for API request
 * 
 * @param {Date} date - Date to format
 * @returns {String} Formatted date string (DD-MM-YYYY)
 */
const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Format the prayer times API response
 * 
 * @param {Object} response - API response
 * @returns {Object} Formatted prayer times
 */
const formatPrayerTimesResponse = (response) => {
  const { data } = response;
  
  return {
    date: {
      readable: data.date.readable,
      gregorian: data.date.gregorian,
      hijri: data.date.hijri
    },
    timings: {
      fajr: data.timings.Fajr,
      sunrise: data.timings.Sunrise,
      dhuhr: data.timings.Dhuhr,
      asr: data.timings.Asr,
      maghrib: data.timings.Maghrib,
      isha: data.timings.Isha
    },
    meta: data.meta
  };
};