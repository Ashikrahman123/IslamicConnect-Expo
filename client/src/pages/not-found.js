import React from 'react';
import { Link } from 'wouter';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-4 text-textColor">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <a className="btn-primary inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Return to Home
          </a>
        </Link>
      </div>
      
      {/* Islamic Pattern Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 islamic-pattern opacity-30"></div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-primary text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Islamic Community App</p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
