import axios from 'axios';
import { ISLAMIC_CALENDAR_API } from '../constants/api';

/**
 * Convert a Gregorian date to Hijri date
 * 
 * @param {Date} gregorianDate - Gregorian date to convert
 * @returns {Promise<Object>} Hijri date information
 */
export const convertToHijri = async (gregorianDate) => {
  try {
    const formattedDate = formatDate(gregorianDate);
    const response = await axios.get(`${ISLAMIC_CALENDAR_API}/${formattedDate}`);
    return response.data.data;
  } catch (error) {
    console.error('Error converting to Hijri:', error);
    throw error;
  }
};

/**
 * Get Hijri calendar for a specific month and year
 * 
 * @param {Number} year - Hijri year
 * @param {Number} month - Hijri month (1-12)
 * @returns {Promise<Object>} Hijri calendar information
 */
export const getHijriCalendar = async (year, month) => {
  try {
    const response = await axios.get(`${ISLAMIC_CALENDAR_API}/${year}/${month}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching Hijri calendar for ${year}/${month}:`, error);
    throw error;
  }
};

/**
 * Get current Hijri date
 * 
 * @returns {Promise<Object>} Current Hijri date information
 */
export const getCurrentHijriDate = async () => {
  try {
    const today = new Date();
    return await convertToHijri(today);
  } catch (error) {
    console.error('Error getting current Hijri date:', error);
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
 * Get special Islamic days/events for a Hijri year
 * 
 * @param {Number} year - Hijri year
 * @returns {Array} List of special Islamic days
 */
export const getIslamicSpecialDays = (year) => {
  return [
    { month: 1, day: 1, name: "Islamic New Year", description: `1st of Muharram, ${year} Hijri` },
    { month: 1, day: 10, name: "Day of Ashura", description: `10th of Muharram, ${year} Hijri` },
    { month: 3, day: 12, name: "Mawlid al-Nabi", description: `Prophet Muhammad's Birthday, 12th of Rabi' al-Awwal, ${year} Hijri` },
    { month: 7, day: 27, name: "Laylat al-Mi'raj", description: `Night Journey, 27th of Rajab, ${year} Hijri` },
    { month: 8, day: 15, name: "Laylat al-Bara'at", description: `Night of Emancipation, 15th of Sha'ban, ${year} Hijri` },
    { month: 9, day: 1, name: "First day of Ramadan", description: `1st of Ramadan, ${year} Hijri` },
    { month: 9, day: 27, name: "Laylat al-Qadr", description: `Night of Power, 27th of Ramadan, ${year} Hijri` },
    { month: 10, day: 1, name: "Eid al-Fitr", description: `Festival of Breaking the Fast, 1st of Shawwal, ${year} Hijri` },
    { month: 12, day: 8, name: "Day of Arafah", description: `8th of Dhu al-Hijjah, ${year} Hijri` },
    { month: 12, day: 10, name: "Eid al-Adha", description: `Festival of Sacrifice, 10th of Dhu al-Hijjah, ${year} Hijri` }
  ];
};