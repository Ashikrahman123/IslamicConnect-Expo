import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import Navbar from '../components/navbar';
import AudioPlayer from '../components/audio-player';

const AudioLibraryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAudio, setFilteredAudio] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  
  // Fetch all audio content
  const { data: audioContents, isLoading: isLoadingAudio } = useQuery({
    queryKey: ['/api/audio'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/audio');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Fetch audio categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/audio-categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/audio-categories');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Search audio content
  const { data: searchResults, isLoading: isSearching, refetch: refetchSearch } = useQuery({
    queryKey: ['searchAudio', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiRequest('GET', `/api/audio/search?query=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: false, // Don't auto fetch
    staleTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Filter audio content based on active tab
  useEffect(() => {
    if (!audioContents) return;
    
    if (activeTab === 'all') {
      setFilteredAudio(audioContents);
    } else if (activeTab === 'search' && searchResults) {
      setFilteredAudio(searchResults);
    } else {
      const filtered = audioContents.filter(audio => audio.category === activeTab);
      setFilteredAudio(filtered);
    }
  }, [activeTab, audioContents, searchResults]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      refetchSearch();
    }
  };
  
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Play audio track
  const playAudio = (audio) => {
    setCurrentAudio(audio);
  };
  
  // Close audio player
  const closeAudioPlayer = () => {
    setCurrentAudio(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <h1 className="text-3xl font-bold mb-6 text-primary">Audio Library</h1>
        
        {/* Search bar */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search for lectures, speakers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input flex-1"
            />
            <button type="submit" className="btn-primary">
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Search
                </div>
              )}
            </button>
          </form>
        </div>
        
        {/* Category tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
            >
              All Content
            </button>
            
            {categories && categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === category ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Audio content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingAudio || isLoadingCategories ? (
            // Loading state
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))
          ) : filteredAudio && filteredAudio.length > 0 ? (
            // Audio content cards
            filteredAudio.map((audio) => (
              <div key={audio.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-primary islamic-pattern flex items-center justify-center relative">
                  <button
                    onClick={() => playAudio(audio)}
                    className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                    {formatDuration(audio.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-primary">{audio.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{audio.speaker}</p>
                  <p className="text-gray-700 text-sm line-clamp-2">{audio.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {audio.category}
                    </span>
                    <button
                      onClick={() => playAudio(audio)}
                      className="text-primary hover:text-accent flex items-center text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Play
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // No content state
            <div className="col-span-full text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
              <p className="text-gray-500 text-lg">No audio content found</p>
              {activeTab === 'search' && (
                <p className="text-gray-500">Try a different search query</p>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Audio Player */}
      {currentAudio && (
        <AudioPlayer
          audioTrack={currentAudio}
          onClose={closeAudioPlayer}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-primary text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Islamic Community App</p>
          <p className="text-sm mt-2">Designed and developed with ❤️ for the Muslim community</p>
        </div>
      </footer>
    </div>
  );
};

export default AudioLibraryPage;
