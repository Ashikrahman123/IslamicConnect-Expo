import React from 'react';
import { useAuth } from '../hooks/use-auth';
import Navbar from '../components/navbar';
import PrayerTimes from '../components/prayer-times';
import IslamicCalendar from '../components/islamic-calendar';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="card islamic-decoration">
            <div className="pt-6">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                Welcome{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="mt-2 text-gray-600">
                Peace be upon you. Access prayer times, Islamic calendar, and spiritual content in one place.
              </p>
            </div>
          </div>
        </section>
        
        {/* Main Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Prayer Times */}
          <section>
            <PrayerTimes />
          </section>
          
          {/* Right Column - Islamic Calendar */}
          <section>
            <IslamicCalendar />
          </section>
        </div>
        
        {/* Features Section */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-primary">Explore Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="card bg-white hover:shadow-lg transition-shadow">
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Prayer Times</h3>
                <p className="text-gray-600">Accurate prayer times based on your location with multiple calculation methods.</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="card bg-white hover:shadow-lg transition-shadow">
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Islamic Calendar</h3>
                <p className="text-gray-600">Keep track of important Islamic dates and events throughout the year.</p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="card bg-white hover:shadow-lg transition-shadow">
              <div className="p-4 flex flex-col items-center text-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Audio Library</h3>
                <p className="text-gray-600">Listen to Islamic lectures, Quran recitations, and educational content.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
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

export default HomePage;
