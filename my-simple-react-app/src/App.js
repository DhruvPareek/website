import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components or pages
function Home() {
    return (
        <div>
            <div className='content'>
                <h2>Random funky stuff:</h2>
                <ul>
                    <li><a href="http://dartstracker301.xyz" target="_blank" rel="noopener noreferrer">Darts Tracker</a></li>
                    <li><a href="https://github.com/DhruvPareek/HIllTalkV2" target="_blank" rel="noopener noreferrer">Hilltalk</a></li>
                    <li><a href="https://bold-doll-6ca.notion.site/cb6726e483d14fedb2ad2632f65e1407?v=1c8cf307c77e4ad4854e4a4cd9e6abc6" target="_blank" rel="noopener noreferrer">Blockchain Learning Resource</a></li>
                    <li><a href="https://youtube.com/playlist?list=PLsmKXxXxQhJSZUidAgoepyXiL37bdPtx1&si=LRrmYGGCmpFVV_Cm" target="_blank" rel="noopener noreferrer">Blockchain@UCLA presentations</a></li>
                    <li><a href="https://www.youtube.com/@dpak576" target="_blank" rel="noopener noreferrer">Videos</a></li>
                </ul>
            </div>
            <div className='pics'>
                <img src="/collage_copy.jpg" alt="collage" className="image2"/>
                <img src="/wanderer.jpeg" alt="Main" className="image4"/>
            </div>
        </div>
    );
}

function Contact() {
    return (
    <div>
        <div className='content'>
        <ul>
            <li>dhruvpareek883@gmail.com</li>
            <li><a href="https://twitter.com/dpak_1024" target="_blank" rel="noopener noreferrer">twitter</a></li>
        </ul>
        </div>
        <div className='pics'>
            <img src="/RIP.jpg" alt="rip" className="image3"/>
            <img src="/steph.jpeg" alt="Main" className="image5"/>
        </div>
    </div>
    );    
}

function AssortedLinks() {
    return (
    <div className='content'>
    <div style={{color: '#2b3e50'}}>
        In no specific order:
    </div>
    <ul>
        <li><a href="https://paulgraham.com/selfindulgence.html" target="_blank" rel="noopener noreferrer">How to Lose Time and Money (Paul Graham)</a></li>
        <li><a href="https://a16z.com/why-bitcoin-matters/" target="_blank" rel="noopener noreferrer">Why Bitcoin Matters (Marc Andreesen)</a></li>
        <li><a href="https://www.youtube.com/watch?v=liz8rZx1NJ8&t=3186s&ab_channel=PBDPodcast" target="_blank" rel="noopener noreferrer">Tom Brady Interview With PBD</a></li>
        <li><a href="https://www.youtube.com/watch?v=o5fdhfVrg1I&ab_channel=NFLFilms" target="_blank" rel="noopener noreferrer">The Brady 6</a></li>
        <li><a href="https://www.paulgraham.com/conformism.html" target="_blank" rel="noopener noreferrer">The Four Quadrants of Conformism (Paul Graham)</a></li>
        <li><a href="https://www.paulgraham.com/say.html" target="_blank" rel="noopener noreferrer">What You Can't Say (Paul Graham)</a></li>
        <li><a href="https://www.youtube.com/watch?v=wLn28DrSF68&ab_channel=HarvardBusinessSchool" target="_blank" rel="noopener noreferrer">Building A Life Lecture (Howard H. Stevenson)</a></li>
        <li><a href="https://wellsbaum.blog/alan-watts-story-of-the-chinese-farmer/" target="_blank" rel="noopener noreferrer">The Story of the Chinese Farmer (Alan Watts)</a></li>
        <li><a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer">Meyers Briggs Personality Test</a></li>
        <li><a href="https://cdixon.org/2009/09/19/climbing-the-wrong-hill" target="_blank" rel="noopener noreferrer">Climbing the Wrong Hill (Chris Dixon)</a></li>
        <li><a href="https://www.youtube.com/watch?v=1qeWugmiGt4&ab_channel=6Fxc24" target="_blank" rel="noopener noreferrer">Game with the Supreme Facist (Paul Erdos)</a></li>
        <li><a href="https://www.goodreads.com/quotes/7-it-is-not-the-critic-who-counts-not-the-man" target="_blank" rel="noopener noreferrer">The Man in the Arena (Theodore Roosevelt)</a></li>
        <li><a href="https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fqk2ktutoo68z.jpg" target="_blank" rel="noopener noreferrer">Chief Justice John Roberts Commencement Speach Quote</a></li>
        <li><a href="https://paulgraham.com/wisdom.html" target="_blank" rel="noopener noreferrer">Is it Worth Being Wise? Intelligence vs Wisdom (Paul Graham)</a></li>
        <li><a href="https://youtu.be/3qHkcs3kG44?si=pOhVjEF5zzAjLIXC" target="_blank" rel="noopener noreferrer">Naval Ravikant Interview JRE</a></li>
        <li><a href="https://open.spotify.com/episode/3DQfcTY4viyXsIXQ89NXvg?si=4a22621fcfb14a75" target="_blank" rel="noopener noreferrer">Robert F. Kennedy Jr. Interview JRE</a></li>
        <li><a href="https://www.amazon.com/Naked-Economics-Undressing-Science-Revised/dp/0393337642" target="_blank" rel="noopener noreferrer">Naked Economics: Undressing the Dismal Science (Charles Wheelan)</a></li>
        <li><a href="https://www.amazon.com/Shoe-Dog-Memoir-Creator-Nike-ebook/dp/B0176M1A44" target="_blank" rel="noopener noreferrer">Shoe Dog: A Memoir by the Creator of Nike (Phil Knight)</a></li>
        <li><a href="https://www.amazon.com/Steve-Jobs-Walter-Isaacson/dp/1451648537" target="_blank" rel="noopener noreferrer">Steve Jobs (Walter Isaacson)</a></li>
        <li><a href="https://www.gutenberg.org/files/84/84-h/84-h.htm" target="_blank" rel="noopener noreferrer">Frankenstein (Mary Shelley)</a></li>
        <li><a href="https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296" target="_blank" rel="noopener noreferrer">Zero to One: Notes on Startups, or How to Build the Future (Peter Thiel)</a></li>
        <li><a href="https://www.amazon.com/Steve-Jobs-Walter-Isaacson/dp/1451648537" target="_blank" rel="noopener noreferrer">Steve Jobs (Walter Isaacson)</a></li>
        <li><a href="https://www.amazon.com/Outliers-Story-Success-Malcolm-Gladwell/dp/0316017930" target="_blank" rel="noopener noreferrer">Outliers: The Story of Success (Malcolm Gladwell)</a></li>
        <li><a href="https://www.amazon.com/Short-History-Nearly-Everything-Illustrated/dp/0307885151/ref=sr_1_4?crid=ZJHBDGPA3GD&dib=eyJ2IjoiMSJ9.U4DBIT6mA30DzuVlDswfh9QCaah39vyugjiWufPrqhXnfILUibgWPE7uF6YTHu53LShTydtTWU-siG7vtVqdoeWoUoq-9ej1fWqsyeH70_h788xqgBnISNv5EF3VsBT2VErHu9cgqzzp2eCDcSpRSw.Ic38iBQKw1pmleVVvYmWKryVIqP5SGWMoj1qgIrXkdE&dib_tag=se&keywords=a+short+history+of+nearly+everything&qid=1705278859&s=books&sprefix=a+short+hi%2Cstripbooks%2C169&sr=1-4" target="_blank" rel="noopener noreferrer">A Short History of Nearly Everything (Bill Bryson)</a></li>
        <li><a href="https://www.amazon.com/Elon-Musk-Walter-Isaacson/dp/1982181281" target="_blank" rel="noopener noreferrer">Elon Musk (Walter Isaacson)</a></li>
        <li><a href="https://www.youtube.com/watch?v=aGNUWY_aePU&ab_channel=DaveFeinstein" target="_blank" rel="noopener noreferrer">Everybody wants to be the beast (Nick Saban)</a></li>
        <li><a href="https://www.goodreads.com/quotes/845-the-individual-has-always-had-to-struggle-to-keep-from" target ="_blank" rel="noopener noreferrer">The Struggle of the Individual (Friedrich Nietzsche)</a></li>
    </ul>
    </div>
    );    
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
                    <Link to="/assortedLinks">Assorted Links</Link>
                    <Link to="/contact">Contact</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/assortedLinks" element={<AssortedLinks />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
