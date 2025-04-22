const axios = require('axios');

/**
 * Service for fetching prayer times from the external API
 */
class PrayerTimesService {
  constructor() {
    this.apiBaseUrl = 'http://api.aladhan.com/v1';
    this.calculationMethods = {
      MWL: 3,  // Muslim World League
      ISNA: 2, // Islamic Society of North America
      Egypt: 5, // Egyptian General Authority of Survey
      Makkah: 4, // Umm al-Qura University, Makkah
      Karachi: 1, // University of Islamic Sciences, Karachi
      Tehran: 7, // Institute of Geophysics, University of Tehran
      Jafari: 0 // Shia Ithna Ashari
    };
  }

  /**
   * Get prayer times for a specific date and location
   * 
   * @param {Date} date - Date for prayer times
   * @param {Number} latitude - Location latitude
   * @param {Number} longitude - Location longitude
   * @param {String} method - Calculation method (default: 'MWL')
   * @returns {Promise<Object>} Prayer times object
   */
  async getPrayerTimes(date, latitude, longitude, method = 'MWL') {
    try {
      const formattedDate = this.formatDate(date);
      const methodId = this.calculationMethods[method] || this.calculationMethods.MWL;
      
      const response = await axios.get(`${this.apiBaseUrl}/timings/${formattedDate}`, {
        params: {
          latitude,
          longitude,
          method: methodId
        }
      });
      
      return this.formatPrayerTimesResponse(response.data);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw new Error('Failed to fetch prayer times');
    }
  }

  /**
   * Get prayer times for a specific date by city name
   * 
   * @param {Date} date - Date for prayer times
   * @param {String} city - City name
   * @param {String} country - Country name
   * @param {String} method - Calculation method (default: 'MWL')
   * @returns {Promise<Object>} Prayer times object
   */
  async getPrayerTimesByCity(date, city, country, method = 'MWL') {
    try {
      const formattedDate = this.formatDate(date);
      const methodId = this.calculationMethods[method] || this.calculationMethods.MWL;
      
      const response = await axios.get(`${this.apiBaseUrl}/timingsByCity/${formattedDate}`, {
        params: {
          city,
          country,
          method: methodId
        }
      });
      
      return this.formatPrayerTimesResponse(response.data);
    } catch (error) {
      console.error('Error fetching prayer times by city:', error);
      throw new Error('Failed to fetch prayer times');
    }
  }

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
  async getMonthlyPrayerTimes(year, month, latitude, longitude, method = 'MWL') {
    try {
      const methodId = this.calculationMethods[method] || this.calculationMethods.MWL;
      
      const response = await axios.get(`${this.apiBaseUrl}/calendar/${year}/${month}`, {
        params: {
          latitude,
          longitude,
          method: methodId
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly prayer times:', error);
      throw new Error('Failed to fetch monthly prayer times');
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
   * Format the prayer times API response
   * 
   * @param {Object} response - API response
   * @returns {Object} Formatted prayer times
   */
  formatPrayerTimesResponse(response) {
    const { data } = response;
    
    if (!data || !data.timings) {
      throw new Error('Invalid prayer times data');
    }
    
    const { timings, date } = data;
    
    return {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date: {
        gregorian: date.gregorian,
        hijri: date.hijri
      }
    };
  }
}

module.exports = new PrayerTimesService();
