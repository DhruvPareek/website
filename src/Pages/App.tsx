import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import '../Styling/App.css';
import ScaleEssay from './ScaleEssay.tsx';
import EthicsEssay from './EthicsEssay.tsx';
import AssortedLinks from './AssortedLinks.tsx';
import Home from './Home.tsx';
import Contact from './Contact.tsx';

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
                <a href="/resume.html" target="_blank" rel="noopener noreferrer">Resume</a>
                <Link to="/assortedLinks">Assorted Links</Link>
                <Link to="/contact">Contact</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/assortedLinks" element={<AssortedLinks />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/scaleEssay" element={<ScaleEssay />} />
                <Route path="/EthicsEssay" element={<EthicsEssay />} />
            </Routes>
        </div>
    </Router>
);
}

export default App
