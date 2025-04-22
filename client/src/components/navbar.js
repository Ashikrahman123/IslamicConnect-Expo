import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../hooks/use-auth';

const Navbar = () => {
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span className="text-xl font-bold">Islamic Community</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="hover:text-accent transition-colors">Home</a>
            </Link>
            <Link href="/calendar">
              <a className="hover:text-accent transition-colors">Calendar</a>
            </Link>
            <Link href="/audio-library">
              <a className="hover:text-accent transition-colors">Audio Library</a>
            </Link>
            {user ? (
              <>
                <Link href="/profile">
                  <a className="hover:text-accent transition-colors">Profile</a>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-white text-primary hover:bg-accent hover:text-white px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth">
                <a className="bg-white text-primary hover:bg-accent hover:text-white px-4 py-2 rounded-md transition-colors">Login</a>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link href="/">
              <a className="block py-2 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
            </Link>
            <Link href="/calendar">
              <a className="block py-2 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Calendar</a>
            </Link>
            <Link href="/audio-library">
              <a className="block py-2 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Audio Library</a>
            </Link>
            {user ? (
              <>
                <Link href="/profile">
                  <a className="block py-2 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Profile</a>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-accent transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth">
                <a className="block py-2 hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Login</a>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
