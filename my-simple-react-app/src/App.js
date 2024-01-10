import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components or pages
function Home() {
    return (
        <div className='content'>
            <h3>Random funky stuff:</h3>
            <ul>
                <li><a href="http://dartstracker301.xyz" target="_blank" rel="noopener noreferrer">Darts Tracker</a></li>
                <li><a href="https://github.com/DhruvPareek/HIllTalkV2" target="_blank" rel="noopener noreferrer">Hilltalk</a></li>
                <li><a href="https://www.youtube.com/@dpak576" target="_blank" rel="noopener noreferrer">videos</a></li>
            </ul>
        </div>
    );
}

function Contact() {
    return (
    <div className='content'>
    <ul>
        <li>dhruvpareek883@gmail.com</li>
        <li><a href="https://twitter.com/dpak_1024" target="_blank" rel="noopener noreferrer">twitter</a></li>
    </ul>
    </div>);    
}

// App Component
function App() {
    return (
        <Router>
            <div>
            <img src="/main.png" alt="Main" className="main-image"/>
                <header>
                    <h1>Dhruv Pareek</h1>
                </header>
                <nav>
                    <Link to="/">Home</Link>
                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
                    <Link to="/contact">Contact</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
                <div className='pics'>
                    <img src="/RIP.jpg" alt="Main" className="image3"/>
                    <img src="/collage_copy.jpg" alt="Main" className="image2"/>
                </div>
            </div>
        </Router>
    );
}

export default App;
