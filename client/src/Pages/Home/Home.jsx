import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Include custom CSS for particle effects

function HomePage() {
  const navigate = useNavigate();
  const [stickyNotes, setStickyNotes] = useState([]);

  useEffect(() => {
    // Particle background effect initialization
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 150;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesArray = [];
      initParticles();
    });

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 5 + 1;
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.size > 0.2) this.size -= 0.1;
    };

    Particle.prototype.draw = function () {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    };

    function initParticles() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function handleParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        if (particlesArray[i].size <= 0.2) {
          particlesArray[i] = new Particle();
        }
      }
      requestAnimationFrame(handleParticles);
    }

    initParticles();
    handleParticles(); // Start the particle animation

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  useEffect(() => {
    // Generate sticky notes at random positions
    const generateStickyNotes = () => {
      const notes = Array.from({ length: 3 }).map((_, index) => ({
        id: index,
        size: `${Math.random() * 40 + 40}px`,
        rotation: `${Math.random() * 360}deg`,
        left: `${Math.random() * 100}vw`,
        bottom: `${Math.random() * 100}vh`,
        animationDelay: `${Math.random() * 2}s`,
      }));
      setStickyNotes(notes);
    };

    generateStickyNotes();
  }, []); // Run only once on component mount

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <canvas id="particle-canvas" className="absolute top-0 left-0"></canvas>
      <div className="relative z-10 text-center p-10 bg-black bg-opacity-20 rounded-3xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20">
        <h1 className="text-6xl font-extrabold text-white mb-4 animate-slide-in glow-text">Welcome to Sticky Clikki Notes</h1>
        <h2 className="text-lg text-gray-300 mb-8 animate-fade-in">Your most powerful yet simple sticky notes</h2>

        <div className="flex justify-center space-x-6">
          <button
            onClick={() => navigate('/login')}
            className="relative inline-block px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-blue-600 rounded-lg neon-button transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"
          >
            Login
            <span className="absolute inset-0 w-full h-full bg-blue-700 opacity-30 rounded-lg"></span>
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="relative inline-block px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-green-500 to-teal-600 border-2 border-green-600 rounded-lg neon-button transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-600 focus:ring-opacity-50"
          >
            Sign Up
            <span className="absolute inset-0 w-full h-full bg-green-700 opacity-30 rounded-lg"></span>
          </button>
        </div>

        {/* Optional: Render sticky notes if needed */}
        <div className="sticky-notes-container">
          {stickyNotes.map(note => (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                width: note.size,
                height: note.size,
                left: note.left,
                bottom: note.bottom,
                transform: `rotate(${note.rotation})`,
                transitionDelay: note.animationDelay,
              }}
              className="sticky-note"
            >
              {/* Note content goes here */}
              Note {note.id + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
