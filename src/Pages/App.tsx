import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../Styling/App.css';
import ScaleEssay from './ScaleEssay.tsx';
import EthicsEssay from './EthicsEssay.tsx';
import QMDBEssay from './QMDBEssay.tsx';
import AssortedLinks from './AssortedLinks.tsx';
import Home from './Home.tsx';
import Contact from './Contact.tsx';

// Moon icon component
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

// Sun icon component
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <img src="/main_gemini.png" alt="Dhruv Pareek" className="profile-image" />
          <div className="profile-info">
            <span className="profile-name">Dhruv Pareek</span>
            <span className="profile-title">Engineer at <a href="https://lightspark.com" target="_blank" rel="noopener noreferrer">Lightspark</a></span>
          </div>
        </header>

        <nav className="top-nav">
          <Link to="/">Home</Link>
          <a href="/resume.html" target="_blank" rel="noopener noreferrer">Resume</a>
          <Link to="/contact">Contact</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assortedLinks" element={<AssortedLinks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/scaleEssay" element={<ScaleEssay />} />
          <Route path="/EthicsEssay" element={<EthicsEssay />} />
          <Route path="/QMDBEssay" element={<QMDBEssay />} />
        </Routes>

        <div className="theme-toggle">
          <button 
            className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={setDarkTheme}
            aria-label="Dark mode"
          >
            <MoonIcon />
          </button>
          <button 
            className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={setLightTheme}
            aria-label="Light mode"
          >
            <SunIcon />
          </button>
        </div>
      </div>
    </Router>
  );
}

export default App
