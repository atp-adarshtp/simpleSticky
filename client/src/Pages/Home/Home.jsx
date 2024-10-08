import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Include custom CSS for the page

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-white mb-4">Welcome to Sticky Clikki Notes</h1>
        <h2 className="text-lg text-gray-300 mb-8">Your most powerful yet simple sticky notes</h2>

        <div className="flex justify-center space-x-6">
          <button
            onClick={() => navigate('/login')}
            className="relative inline-block px-8 py-3 text-lg font-bold text-gray-800 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 border-2 border-blue-400 rounded-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="relative inline-block px-8 py-3 text-lg font-bold text-gray-800 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 border-2 border-blue-400 rounded-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
