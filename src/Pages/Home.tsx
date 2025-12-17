import '../Styling/App.css';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className='content'>
            <ul>
                <li><a href="https://github.com/DhruvPareek/TheBookFund/tree/main" target="_blank" rel="noopener noreferrer">The Book Fund</a></li>
                <li><a href="https://micropayments-one.vercel.app/" target="_blank" rel="noopener noreferrer">Micropayments</a></li>
                <li><a href="https://safe-transactions-frontend.vercel.app/" target="_blank" rel="noopener noreferrer">Safe transactions</a></li>
                <li><Link to="/EthicsEssay">Ethical blockchain regulations</Link></li>
                <li><a href="http://dartstracker301.xyz" target="_blank" rel="noopener noreferrer">Darts tracker</a></li>
                <li><Link to="/scaleEssay">On the scale of networks</Link></li>
                <li><a href="https://github.com/DhruvPareek/HIllTalkV2" target="_blank" rel="noopener noreferrer">Hilltalk</a></li>
                <li><a href="https://bold-doll-6ca.notion.site/cb6726e483d14fedb2ad2632f65e1407?v=1c8cf307c77e4ad4854e4a4cd9e6abc6" target="_blank" rel="noopener noreferrer">Blockchain learning resource</a></li>
                <li><a href="https://youtube.com/playlist?list=PLsmKXxXxQhJSZUidAgoepyXiL37bdPtx1&si=LRrmYGGCmpFVV_Cm" target="_blank" rel="noopener noreferrer">Blockchain at UCLA presentations</a></li>
            </ul>
        </div>
    );
}

export default Home;
