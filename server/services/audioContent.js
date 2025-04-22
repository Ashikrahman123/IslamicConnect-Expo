const { storage } = require('../storage');

/**
 * Service for managing audio content
 */
class AudioContentService {
  /**
   * Get all audio content
   * 
   * @returns {Promise<Array>} List of all audio content
   */
  async getAllAudioContent() {
    try {
      return await storage.getAudioContents();
    } catch (error) {
      console.error('Error fetching all audio content:', error);
      throw new Error('Failed to fetch audio content');
    }
  }

  /**
   * Get audio content by ID
   * 
   * @param {Number} id - Audio content ID
   * @returns {Promise<Object>} Audio content item
   */
  async getAudioContentById(id) {
    try {
      const audioContent = await storage.getAudioContentById(Number(id));
      
      if (!audioContent) {
        throw new Error('Audio content not found');
      }
      
      return audioContent;
    } catch (error) {
      console.error(`Error fetching audio content with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get audio content by category
   * 
   * @param {String} category - Category name
   * @returns {Promise<Array>} List of audio content in the category
   */
  async getAudioContentByCategory(category) {
    try {
      return await storage.getAudioContentsByCategory(category);
    } catch (error) {
      console.error(`Error fetching audio content in category ${category}:`, error);
      throw new Error('Failed to fetch audio content by category');
    }
  }

  /**
   * Get all available categories
   * 
   * @returns {Promise<Array>} List of unique categories
   */
  async getCategories() {
    try {
      const audioContents = await storage.getAudioContents();
      const categories = [...new Set(audioContents.map(item => item.category))];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Search audio content
   * 
   * @param {String} query - Search query
   * @returns {Promise<Array>} Search results
   */
  async searchAudioContent(query) {
    try {
      if (!query) return [];
      
      const audioContents = await storage.getAudioContents();
      const lowercaseQuery = query.toLowerCase();
      
      return audioContents.filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.speaker.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error(`Error searching audio content with query ${query}:`, error);
      throw new Error('Failed to search audio content');
    }
  }
}

module.exports = new AudioContentService();
