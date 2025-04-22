import axios from 'axios';
import { API_URL } from '../constants/api';

/**
 * Get all audio content
 * 
 * @returns {Promise<Array>} List of all audio content
 */
export const getAllAudioContent = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/audio`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audio content:', error);
    throw error;
  }
};

/**
 * Get audio content by ID
 * 
 * @param {Number} id - Audio content ID
 * @returns {Promise<Object>} Audio content item
 */
export const getAudioContentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/audio/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching audio content ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get audio content by category
 * 
 * @param {String} category - Category name
 * @returns {Promise<Array>} List of audio content in the category
 */
export const getAudioContentByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/api/audio/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching audio content for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get all available categories
 * 
 * @returns {Promise<Array>} List of unique categories
 */
export const getCategories = async () => {
  try {
    const audioContent = await getAllAudioContent();
    const categories = [...new Set(audioContent.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Search audio content
 * 
 * @param {String} query - Search query
 * @returns {Promise<Array>} Search results
 */
export const searchAudioContent = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/api/audio/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching audio content for "${query}":`, error);
    throw error;
  }
};

/**
 * Get featured audio content
 * 
 * @param {Number} limit - Number of items to fetch (default: 5)
 * @returns {Promise<Array>} Featured audio content
 */
export const getFeaturedAudioContent = async (limit = 5) => {
  try {
    const allContent = await getAllAudioContent();
    // Filter for featured content or just return the most recent
    return allContent.slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured audio content:', error);
    throw error;
  }
};