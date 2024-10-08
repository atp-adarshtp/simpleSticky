import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import config from '../../config';
import './Signup.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const remoteUrl = config.REACT_APP_REMOTE_SIGNUP_URL;
  const localUrl = config.REACT_APP_LOCAL_SIGNUP_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post(remoteUrl, { name, email, password }, { headers: { 'x-api-key': 'your-secret-api-key' }, timeout: 5000 });
      console.log('Signup successful:', response.data);
      navigate('/login');
    } catch (error) {
      try {
        const response = await axios.post(localUrl, { name, email, password }, { headers: { 'x-api-key': 'your-secret-api-key' }, timeout: 5000 });
        console.log('Signup successful with local URL:', response.data);
        navigate('/login');
      } catch (localError) {
        setError('Signup failed. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <div className="relative z-10 text-center p-10 bg-black bg-opacity-20 rounded-3xl shadow-2xl backdrop-blur-lg border border-white border-opacity-20">
        <h2 className="text-4xl font-extrabold text-white mb-6">Create Account</h2>
        <form onSubmit={handleSignup} className="signup-form">
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="signup-input"
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="signup-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="signup-input"
          />
          <button 
            type="submit" 
            className="relative inline-block px-8 py-3 text-lg font-bold text-gray-800 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 border-2 border-blue-400 rounded-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing Up...' : 'Signup'}
          </button>
          <p className="login-link mt-4 text-gray-300">
            Already have an account? <Link to="/login" className="text-blue-400 underline">Login</Link>
          </p>
          {error && <p className="signup-error text-red-500 mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
