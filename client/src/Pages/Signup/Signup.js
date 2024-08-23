import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import config from '../../config';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const remoteUrl = config.REACT_APP_REMOTE_SIGNUP_URL;
  const localUrl = config.REACT_APP_LOCAL_SIGNUP_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(remoteUrl, {
        name,
        email,
        password
      }, {
        headers: {
          'x-api-key': 'your-secret-api-key'
        },
        timeout: 5000 // Set the timeout to 5000 ms (5 seconds)
      });
      console.log('Signup successful:', response.data);
      navigate('/login'); // Navigate to the dashboard upon successful signup
    } catch (error) {
      console.error('Error signing up with remote URL, trying local URL:', error.message);
      try {
        const response = await axios.post(localUrl, {
          name,
          email,
          password
        }, {
          headers: {
            'x-api-key': 'your-secret-api-key'
          },
          timeout: 5000 // Set the timeout to 5000 ms (5 seconds)
        });
        console.log('Signup successful with local URL:', response.data);
        navigate('/login'); // Navigate to the dashboard upon successful signup
      } catch (localError) {
        console.error('Error signing up with local URL:', localError.response ? localError.response.data : localError.message);
      }
    }
  };

  return (
    <div className='SinupBody' >
    <div className="sinup-container">
      <div className='sticky-note'>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Signup</button>
      </form>
      </div>
    </div>
    </div>
  );
};

export default SignupPage;
