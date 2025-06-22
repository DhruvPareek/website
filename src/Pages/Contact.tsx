import '../Styling/App.css';

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
            <img src="/wanderer.jpeg" alt="Main" className="image4"/>
            <img src="/steph.jpeg" alt="Main" className="image5"/>
        </div>
    </div>
    );    
}

export default Contact;