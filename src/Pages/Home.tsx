import '../Styling/App.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

type PreviewItem = {
    type: 'image' | 'essay';
    src?: string;
    title?: string;
    excerpt?: string;
} | null;

const previews: Record<string, PreviewItem> = {
    bookfund: {
        type: 'image',
        src: '/Book_fund_preview.png'
    },
    micropayments: {
        type: 'image',
        src: '/micropayments_preview.png'
    },
    safetransactions: {
        type: 'image',
        src: '/Safe_Transaction_Preview.png'
    },
    hilltalk: {
        type: 'image',
        src: '/Hilltalk_preview.png'
    },
    blockchainlearning: {
        type: 'image',
        src: '/blockchain_learning_resource_preview.png'
    },
    blockchainpresentations: {
        type: 'image',
        src: '/blockchain_at_ucla_presentations_preview.png'
    },
    techreading: {
        type: 'image',
        src: '/tech_reading_preview.png'
    },
    ethicsessay: {
        type: 'essay',
        title: 'Ethical Blockchain Regulation',
        excerpt: 'The young cryptocurrency and blockchain technology industry has faced considerable regulatory uncertainty in the United States. This paper argues that a minimal framework of permissive regulation, specifically enacting transparency, consumer rights, and operational guidelines while refraining from excessive regulatory enforcement, is the most ethical path forward in a consequentialist framework...'
    },
    scaleessay: {
        type: 'essay',
        title: 'On the Scale of Networks',
        excerpt: "I've recently become concerned that Ethereum's decentralization priority may always stand in the way of the network's scale being competitive with rival networks. The purpose of this write-up is to define the metrics that determine scalability, compare the differences in these metrics between Ethereum and Solana, and analyze the tradeoffs taken to achieve that scalability..."
    }
};

function Home() {
    const [activePreview, setActivePreview] = useState<PreviewItem>(null);

    return (
        <div className='content home-content'>
            <div className='projects-list'>
                <ul>
                    <li>
                        <a 
                            href="https://github.com/DhruvPareek/TheBookFund/tree/main" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.bookfund)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            The Book Fund
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://micropayments-one.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.micropayments)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Micropayments
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://techreadingclub.xyz/companies" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.techreading)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Technology Reading Club
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://safe-transactions-frontend.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.safetransactions)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Safe Transactions
                        </a>
                    </li>
                    <li>
                        <Link 
                            to="/EthicsEssay"
                            onMouseEnter={() => setActivePreview(previews.ethicsessay)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Ethical Blockchain Regulation
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/scaleEssay"
                            onMouseEnter={() => setActivePreview(previews.scaleessay)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            On the Scale of Networks
                        </Link>
                    </li>
                    <li>
                        <a 
                            href="https://github.com/DhruvPareek/HIllTalkV2" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.hilltalk)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Hilltalk
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://bold-doll-6ca.notion.site/cb6726e483d14fedb2ad2632f65e1407?v=1c8cf307c77e4ad4854e4a4cd9e6abc6" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.blockchainlearning)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Blockchain Learning Resource
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://youtube.com/playlist?list=PLsmKXxXxQhJSZUidAgoepyXiL37bdPtx1&si=LRrmYGGCmpFVV_Cm" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onMouseEnter={() => setActivePreview(previews.blockchainpresentations)}
                            onMouseLeave={() => setActivePreview(null)}
                        >
                            Blockchain at UCLA Presentations
                        </a>
                    </li>
                </ul>
            </div>
            <div className={`preview-container ${activePreview ? 'visible' : ''}`}>
                {activePreview && activePreview.type === 'image' && (
                    <img 
                        src={activePreview.src} 
                        alt="Project preview" 
                        className="preview-image"
                    />
                )}
                {activePreview && activePreview.type === 'essay' && (
                    <div className="preview-essay">
                        <p className="preview-essay-title">{activePreview.title}</p>
                        <p className="preview-essay-excerpt">{activePreview.excerpt}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
