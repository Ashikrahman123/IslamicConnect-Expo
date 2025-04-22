const axios = require('axios');

/**
 * Service for Islamic calendar and hijri date conversion
 */
class IslamicCalendarService {
  constructor() {
    this.apiBaseUrl = 'http://api.aladhan.com/v1';
  }

  /**
   * Convert a Gregorian date to Hijri date
   * 
   * @param {Date} gregorianDate - Gregorian date to convert
   * @returns {Promise<Object>} Hijri date information
   */
  async convertToHijri(gregorianDate) {
    try {
      const formattedDate = this.formatDate(gregorianDate);
      const response = await axios.get(`${this.apiBaseUrl}/gToH/${formattedDate}`);
      
      return response.data.data;
    } catch (error) {
      console.error('Error converting to Hijri date:', error);
      throw new Error('Failed to convert to Hijri date');
    }
  }

  /**
   * Convert a Hijri date to Gregorian date
   * 
   * @param {Number} year - Hijri year
   * @param {Number} month - Hijri month (1-12)
   * @param {Number} day - Hijri day
   * @returns {Promise<Object>} Gregorian date information
   */
  async convertToGregorian(year, month, day) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/hToG/${day}-${month}-${year}`);
      
      return response.data.data;
    } catch (error) {
      console.error('Error converting to Gregorian date:', error);
      throw new Error('Failed to convert to Gregorian date');
    }
  }

  /**
   * Get Hijri calendar for a specific month and year
   * 
   * @param {Number} year - Hijri year
   * @param {Number} month - Hijri month (1-12)
   * @returns {Promise<Object>} Hijri calendar information
   */
  async getHijriCalendar(year, month) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/hijriCalendar/${month}/${year}`);
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Hijri calendar:', error);
      throw new Error('Failed to fetch Hijri calendar');
    }
  }

  /**
   * Get current Hijri date
   * 
   * @returns {Promise<Object>} Current Hijri date information
   */
  async getCurrentHijriDate() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/gToH`);
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current Hijri date:', error);
      throw new Error('Failed to fetch current Hijri date');
    }
  }

  /**
   * Format date for API request
   * 
   * @param {Date} date - Date to format
   * @returns {String} Formatted date string (DD-MM-YYYY)
   */
  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }

  /**
   * Get special Islamic days/events for a Hijri year
   * 
   * @param {Number} year - Hijri year
   * @returns {Array} List of special Islamic days
   */
  getIslamicSpecialDays(year) {
    // These dates are fixed in the Hijri calendar
    return [
      {
        name: "Islamic New Year",
        date: `1-1-${year}`,
        description: "First day of Muharram, marking the beginning of the Islamic calendar"
      },
      {
        name: "Day of Ashura",
        date: `10-1-${year}`,
        description: "Commemorates several events, including when Prophet Nuh (Noah) left the Ark and when Prophet Musa (Moses) was saved from Pharaoh"
      },
      {
        name: "Mawlid al-Nabi",
        date: `12-3-${year}`,
        description: "Celebration of the birth of Prophet Muhammad (PBUH)"
      },
      {
        name: "Start of Rajab",
        date: `1-7-${year}`,
        description: "Beginning of one of the four sacred months in Islam"
      },
      {
        name: "Laylat al-Isra wal-Mi'raj",
        date: `27-7-${year}`,
        description: "The Night Journey and Ascension of Prophet Muhammad (PBUH)"
      },
      {
        name: "Start of Sha'ban",
        date: `1-8-${year}`,
        description: "Beginning of the month preceding Ramadan"
      },
      {
        name: "Laylat al-Bara'at",
        date: `15-8-${year}`,
        description: "The Night of Records"
      },
      {
        name: "Start of Ramadan",
        date: `1-9-${year}`,
        description: "Beginning of the month of fasting"
      },
      {
        name: "Laylat al-Qadr",
        date: `27-9-${year}`,
        description: "The Night of Power, commemorating when the first verses of the Quran were revealed to Prophet Muhammad (PBUH)"
      },
      {
        name: "Eid al-Fitr",
        date: `1-10-${year}`,
        description: "Festival of Breaking the Fast, marking the end of Ramadan"
      },
      {
        name: "Day of Arafah",
        date: `9-12-${year}`,
        description: "The holiest day in Islam, falling on the 9th day of Dhul Hijjah"
      },
      {
        name: "Eid al-Adha",
        date: `10-12-${year}`,
        description: "Festival of Sacrifice, commemorating Ibrahim's willingness to sacrifice his son"
      }
    ];
  }
}

module.exports = new IslamicCalendarService();
