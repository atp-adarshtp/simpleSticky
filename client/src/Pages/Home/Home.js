import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className='HomeBody'>
    <div className="home-container">
    <div className='StickyNotes'>
      <h1 className='h1'>Welcome to simple sticky clikki note</h1>
      <h2>Your most powerful yet simple sticky notes</h2>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/signup')}>SignUp</button>
      </div>
      </div>
    </div>
  );
}


export default HomePage;
