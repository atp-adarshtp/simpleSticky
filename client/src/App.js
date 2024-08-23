import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupPage from './Pages/Signup/Signup';
import LoginPage from './Pages/Login/Login';
import HomePage from './Pages/Home/Home';
import Dashboard from './Pages/Dashboard/Dashboard'; // Import DashboardPage
import "./App.css";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
