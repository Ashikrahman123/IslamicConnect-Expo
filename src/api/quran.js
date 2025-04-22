import axios from 'axios';
import { QURAN_API } from '../constants/api';

/**
 * Get list of all surahs in the Quran
 * 
 * @param {String} edition - Quran edition (default: 'en.asad')
 * @returns {Promise<Array>} List of surahs
 */
export const getSurahs = async (edition = 'en.asad') => {
  try {
    const response = await axios.get(`${QURAN_API}/surah`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
};

/**
 * Get specific surah by number
 * 
 * @param {Number} surahNumber - Surah number (1-114)
 * @param {String} edition - Quran edition (default: 'en.asad')
 * @returns {Promise<Object>} Surah data with verses
 */
export const getSurah = async (surahNumber, edition = 'en.asad') => {
  try {
    const response = await axios.get(`${QURAN_API}/surah/${surahNumber}/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
};

/**
 * Get Arabic text for a specific surah
 * 
 * @param {Number} surahNumber - Surah number (1-114)
 * @returns {Promise<Object>} Surah data with Arabic verses
 */
export const getSurahArabic = async (surahNumber) => {
  try {
    const response = await axios.get(`${QURAN_API}/surah/${surahNumber}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching Arabic surah ${surahNumber}:`, error);
    throw error;
  }
};

/**
 * Get specific verse (ayah) by surah and verse number
 * 
 * @param {Number} surahNumber - Surah number (1-114)
 * @param {Number} verseNumber - Verse number
 * @param {String} edition - Quran edition (default: 'en.asad')
 * @returns {Promise<Object>} Verse data
 */
export const getVerse = async (surahNumber, verseNumber, edition = 'en.asad') => {
  try {
    const response = await axios.get(`${QURAN_API}/ayah/${surahNumber}:${verseNumber}/${edition}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching verse ${surahNumber}:${verseNumber}:`, error);
    throw error;
  }
};

/**
 * Search the Quran for a specific term
 * 
 * @param {String} query - Search query
 * @param {String} edition - Quran edition (default: 'en.asad')
 * @returns {Promise<Array>} Search results
 */
export const searchQuran = async (query, edition = 'en.asad') => {
  try {
    const response = await axios.get(`${QURAN_API}/search/${query}/${edition}`);
    return response.data.data.matches;
  } catch (error) {
    console.error(`Error searching Quran for "${query}":`, error);
    throw error;
  }
};

/**
 * Get audio recitation for a specific surah
 * 
 * @param {Number} surahNumber - Surah number (1-114)
 * @param {String} reciter - Reciter identifier (default: 'ar.alafasy')
 * @returns {Promise<Object>} Audio data
 */
export const getSurahAudio = async (surahNumber, reciter = 'ar.alafasy') => {
  try {
    const response = await axios.get(`${QURAN_API}/surah/${surahNumber}/ar.alafasy`);
    return {
      ...response.data.data,
      audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}.mp3`
    };
  } catch (error) {
    console.error(`Error fetching audio for surah ${surahNumber}:`, error);
    throw error;
  }
};

/**
 * Get list of available Quran editions/translations
 * 
 * @returns {Promise<Array>} List of editions
 */
export const getQuranEditions = async () => {
  try {
    const response = await axios.get(`${QURAN_API}/edition`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Quran editions:', error);
    throw error;
  }
};

/**
 * Get list of available audio reciters
 * 
 * @returns {Promise<Array>} List of reciters
 */
export const getReciters = async () => {
  try {
    const response = await axios.get(`${QURAN_API}/edition/format/audio`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Quran reciters:', error);
    throw error;
  }
};