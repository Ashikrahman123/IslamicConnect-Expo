const session = require('express-session');
const createMemoryStore = require('memorystore');
const { v4: uuidv4 } = require('uuid');

const MemoryStore = createMemoryStore(session);

class InMemoryStorage {
  constructor() {
    this.users = [];
    this.userSettings = [];
    this.audioContents = [];
    this.islamicEvents = [];
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize with some Islamic events
    this.initializeIslamicEvents();
    
    // Initialize with some audio content
    this.initializeAudioContent();
  }

  // User methods
  async getUser(id) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    
    // Don't return password to client
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByUsername(username) {
    return this.users.find(u => u.username === username);
  }

  async createUser(userData) {
    const id = this.users.length + 1;
    const user = {
      id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    
    // Create default user settings
    this.userSettings.push({
      userId: id,
      theme: 'light',
      calculationMethod: 'MWL', // Muslim World League
      notificationsEnabled: true,
      autoPlayAudio: false
    });
    
    // Don't return password to client
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id, userData) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date()
    };
    
    const { password, ...userWithoutPassword } = this.users[index];
    return userWithoutPassword;
  }

  // User settings methods
  async getUserSettings(userId) {
    return this.userSettings.find(s => s.userId === userId);
  }

  async updateUserSettings(userId, settingsData) {
    const index = this.userSettings.findIndex(s => s.userId === userId);
    if (index === -1) return null;
    
    this.userSettings[index] = {
      ...this.userSettings[index],
      ...settingsData
    };
    
    return this.userSettings[index];
  }

  // Audio content methods
  async getAudioContents() {
    return this.audioContents;
  }

  async getAudioContentById(id) {
    return this.audioContents.find(a => a.id === id);
  }

  async getAudioContentsByCategory(category) {
    return this.audioContents.filter(a => a.category === category);
  }

  // Islamic events methods
  async getIslamicEvents() {
    return this.islamicEvents;
  }

  async getIslamicEventById(id) {
    return this.islamicEvents.find(e => e.id === id);
  }

  async getIslamicEventsByMonth(hijriMonth) {
    return this.islamicEvents.filter(e => {
      const [month] = e.hijriDate.split('-').map(Number);
      return month === hijriMonth;
    });
  }

  // Initialize with Islamic events data
  initializeIslamicEvents() {
    this.islamicEvents = [
      {
        id: 1,
        title: "Islamic New Year",
        description: "First day of Muharram, marking the beginning of the Islamic calendar.",
        hijriDate: "1-1",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "holiday"
      },
      {
        id: 2,
        title: "Day of Ashura",
        description: "Commemorates several events, including when Prophet Nuh (Noah) left the Ark and when Prophet Musa (Moses) was saved from Pharaoh.",
        hijriDate: "1-10",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "important_day"
      },
      {
        id: 3,
        title: "Mawlid al-Nabi",
        description: "Celebration of the birth of Prophet Muhammad (PBUH).",
        hijriDate: "3-12",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "holiday"
      },
      {
        id: 4,
        title: "Start of Ramadan",
        description: "Beginning of the month of fasting.",
        hijriDate: "9-1",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "holiday"
      },
      {
        id: 5,
        title: "Laylat al-Qadr",
        description: "The Night of Power, commemorating when the first verses of the Quran were revealed to Prophet Muhammad (PBUH).",
        hijriDate: "9-27",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "important_day"
      },
      {
        id: 6,
        title: "Eid al-Fitr",
        description: "Festival of Breaking the Fast, marking the end of Ramadan.",
        hijriDate: "10-1",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "holiday"
      },
      {
        id: 7,
        title: "Day of Arafah",
        description: "The holiest day in Islam, falling on the 9th day of Dhul Hijjah.",
        hijriDate: "12-9",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "important_day"
      },
      {
        id: 8,
        title: "Eid al-Adha",
        description: "Festival of Sacrifice, commemorating Ibrahim's willingness to sacrifice his son.",
        hijriDate: "12-10",
        gregorianDate: new Date(), // This would be calculated based on current year
        type: "holiday"
      }
    ];
  }

  // Initialize with audio content data
  initializeAudioContent() {
    this.audioContents = [
      {
        id: 1,
        title: "Understanding Surah Al-Fatiha",
        description: "An in-depth explanation of the opening chapter of the Quran.",
        speaker: "Dr. Yasir Qadhi",
        category: "Quran",
        url: "https://ia800203.us.archive.org/14/items/QURAN_MISHARY_RASHID_ALAFASI_MP3/001.mp3",
        duration: 1830, // 30:30
        imageUrl: "/images/quran.jpg",
        createdAt: new Date()
      },
      {
        id: 2,
        title: "The Importance of Prayer",
        description: "A lecture on the significance of Salah in a Muslim's life.",
        speaker: "Mufti Menk",
        category: "Prayer",
        url: "https://ia800203.us.archive.org/14/items/QURAN_MISHARY_RASHID_ALAFASI_MP3/002.mp3",
        duration: 2430, // 40:30
        imageUrl: "/images/prayer.jpg",
        createdAt: new Date()
      },
      {
        id: 3,
        title: "The Life of Prophet Muhammad",
        description: "Biography of the Prophet Muhammad (PBUH).",
        speaker: "Sheikh Omar Suleiman",
        category: "Seerah",
        url: "https://ia800203.us.archive.org/14/items/QURAN_MISHARY_RASHID_ALAFASI_MP3/003.mp3",
        duration: 3630, // 1:00:30
        imageUrl: "/images/prophet.jpg",
        createdAt: new Date()
      },
      {
        id: 4,
        title: "Beautiful Recitation of Surah Yaseen",
        description: "Recitation of Surah Yaseen by Sheikh Mishary Rashid Alafasy.",
        speaker: "Sheikh Mishary Rashid Alafasy",
        category: "Recitation",
        url: "https://ia800203.us.archive.org/14/items/QURAN_MISHARY_RASHID_ALAFASI_MP3/036.mp3",
        duration: 1140, // 19:00
        imageUrl: "/images/recitation.jpg",
        createdAt: new Date()
      },
      {
        id: 5,
        title: "Understanding the Five Pillars of Islam",
        description: "A comprehensive explanation of the five pillars of Islam.",
        speaker: "Dr. Bilal Philips",
        category: "Islamic Knowledge",
        url: "https://ia800203.us.archive.org/14/items/QURAN_MISHARY_RASHID_ALAFASI_MP3/005.mp3",
        duration: 2880, // 48:00
        imageUrl: "/images/pillars.jpg",
        createdAt: new Date()
      }
    ];
  }
}

const storage = new InMemoryStorage();

module.exports = {
  storage
};
