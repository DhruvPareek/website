import { useState } from 'react';
import '../Styling/ErasureCoding.css';
import '../Styling/Essay.css';

const MINIMMIT_URL = 'https://monorepo-three-khaki.vercel.app/minimmit';

function ByzantineDiagram() {
  const [showNote, setShowNote] = useState(false);
  const W = 520;
  const H = 420;
  const cx = W / 2;

  // Node positions: Byzantine at top, two honest nodes at bottom
  const B = { x: cx, y: 80 };
  const H1 = { x: 100, y: 320 };
  const H2 = { x: W - 100, y: 320 };

  // Midpoints for block labels
  const midBH1 = { x: (B.x + H1.x) / 2 - 30, y: (B.y + H1.y) / 2 - 10 };
  const midBH2 = { x: (B.x + H2.x) / 2 + 30, y: (B.y + H2.y) / 2 - 10 };

  return (
    <div className="ec-overview-diagram" style={{ marginTop: 32 }}>
      <div className="ec-diagram-label">pre-GST: byzantine block proposer equivocates</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ss-anim-svg">
        {/* Communication line between H1 and H2 — blocked */}
        <line
          x1={H1.x} y1={H1.y} x2={H2.x} y2={H2.y}
          stroke="var(--text-secondary)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.25}
        />
        {/* X mark in the middle of H1-H2 line to show blocked */}
        <g transform={`translate(${cx}, ${H1.y})`}>
          <line x1={-10} y1={-10} x2={10} y2={10} stroke="#e74c3c" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={10} y1={-10} x2={-10} y2={10} stroke="#e74c3c" strokeWidth={2.5} strokeLinecap="round" />
        </g>
        <text
          x={cx} y={H1.y + 24}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={10}
          fill="#e74c3c"
          opacity={0.8}
          style={{ cursor: 'pointer' }}
          onClick={() => setShowNote(!showNote)}
        >
          communication blocked by adversary
        </text>
        <g className="cm-info-btn" onClick={() => setShowNote(!showNote)}>
          <circle cx={cx + 113} cy={H1.y + 16} r={5} fill="none" stroke="#e74c3c" strokeWidth={0.8} />
          <text x={cx + 113} y={H1.y + 19} textAnchor="middle" fontFamily="'SFMono', monospace" fontSize={7} fontWeight={700} fill="#e74c3c">?</text>
        </g>

        {/* Line from B to H1 */}
        <line
          x1={B.x} y1={B.y + 32} x2={H1.x + 20} y2={H1.y - 28}
          stroke="var(--highlight-color)"
          strokeWidth={1.5}
          opacity={0.5}
        />
        {/* Arrow head B → H1 */}
        <polygon
          points={`${H1.x + 20},${H1.y - 28} ${H1.x + 28},${H1.y - 40} ${H1.x + 12},${H1.y - 36}`}
          fill="var(--highlight-color)"
          opacity={0.5}
        />

        {/* Line from B to H2 */}
        <line
          x1={B.x} y1={B.y + 32} x2={H2.x - 20} y2={H2.y - 28}
          stroke="var(--highlight-color)"
          strokeWidth={1.5}
          opacity={0.5}
        />
        {/* Arrow head B → H2 */}
        <polygon
          points={`${H2.x - 20},${H2.y - 28} ${H2.x - 28},${H2.y - 40} ${H2.x - 12},${H2.y - 36}`}
          fill="var(--highlight-color)"
          opacity={0.5}
        />

        {/* Block labels on edges */}
        <g>
          <rect
            x={midBH1.x - 22} y={midBH1.y - 12}
            width={44} height={24} rx={4}
            fill="var(--bg-color)"
            stroke="var(--highlight-color)"
            strokeWidth={1}
            opacity={0.9}
          />
          <text
            x={midBH1.x} y={midBH1.y + 4}
            textAnchor="middle"
            fontFamily="'SFMono', monospace"
            fontSize={12}
            fontWeight={600}
            fill="var(--highlight-color)"
          >
            B₁
          </text>
        </g>
        <g>
          <rect
            x={midBH2.x - 22} y={midBH2.y - 12}
            width={44} height={24} rx={4}
            fill="var(--bg-color)"
            stroke="var(--highlight-color)"
            strokeWidth={1}
            opacity={0.9}
          />
          <text
            x={midBH2.x} y={midBH2.y + 4}
            textAnchor="middle"
            fontFamily="'SFMono', monospace"
            fontSize={12}
            fontWeight={600}
            fill="var(--highlight-color)"
          >
            B₂
          </text>
        </g>

        {/* Byzantine node */}
        <circle cx={B.x} cy={B.y} r={32} fill="var(--toggle-bg)" stroke="#e74c3c" strokeWidth={2} />
        <text
          x={B.x} y={B.y + 5}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={16}
          fontWeight={700}
          fill="#e74c3c"
        >
          B
        </text>
        <text
          x={B.x} y={B.y - 44}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={10}
          fill="#e74c3c"
          opacity={0.8}
        >
          byzantine
        </text>

        {/* Honest node 1 */}
        <circle cx={H1.x} cy={H1.y} r={32} fill="var(--toggle-bg)" stroke="var(--text-secondary)" strokeWidth={1.5} />
        <text
          x={H1.x} y={H1.y + 5}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={16}
          fontWeight={600}
          fill="var(--text-color)"
        >
          H₁
        </text>


        {/* Honest node 2 */}
        <circle cx={H2.x} cy={H2.y} r={32} fill="var(--toggle-bg)" stroke="var(--text-secondary)" strokeWidth={1.5} />
        <text
          x={H2.x} y={H2.y + 5}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={16}
          fontWeight={600}
          fill="var(--text-color)"
        >
          H₂
        </text>
      </svg>
      {showNote && (
        <>
          <div
            onClick={() => setShowNote(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 999,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px 24px',
            fontSize: 14,
            lineHeight: 1.8,
            color: 'var(--text-color)',
            background: 'var(--bg-color)',
            border: '1px solid var(--toggle-border)',
            borderRadius: 6,
            maxWidth: 440,
            zIndex: 1000,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}>
            In partial synchrony, pre-GST communication is controlled by an adversary who can
            delay message delivery by an arbitrary amount of time. Thus, the messages between
            H₁ and H₂ in this example are delayed by an arbitrary amount of time.
            <div
              onClick={() => setShowNote(false)}
              style={{
                marginTop: 12,
                fontSize: 12,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'right',
                opacity: 0.6,
              }}
            >
              close
            </div>
          </div>
        </>
      )}
      <div className="ss-anim-params">
        <span><strong>n</strong> = 3</span>
        <span className="ss-anim-params-sep">&middot;</span>
        <span><strong>f</strong> = 1</span>
      </div>
    </div>
  );
}

function FinalizationDiagram() {
  const [showNote, setShowNote] = useState(false);
  const W = 520;
  const H = 280;
  const cx = W / 2;

  const H1 = { x: 130, y: 140 };
  const H2 = { x: W - 130, y: 140 };

  return (
    <div className="ec-overview-diagram" style={{ marginTop: 8 }}>
      <div className="ec-diagram-arrow">
        &darr; each honest node heard from n &minus; f = 2 nodes (itself + B)
        <span className="cm-info-btn-inline" onClick={() => setShowNote(!showNote)}>?</span>
      </div>
      {showNote && (
        <>
          <div
            onClick={() => setShowNote(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px 24px',
            fontSize: 14,
            lineHeight: 1.8,
            color: 'var(--text-color)',
            background: 'var(--bg-color)',
            border: '1px solid var(--toggle-border)',
            borderRadius: 6,
            maxWidth: 440,
            zIndex: 1000,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}>
            Once a node hears from <strong style={{ color: 'var(--highlight-color)' }}>n &minus; f</strong> total
            nodes, it must make a decision because of the eventual termination requirement of consensus.
            It can't sit around and wait forever.
            <div
              onClick={() => setShowNote(false)}
              style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'right', opacity: 0.6 }}
            >
              close
            </div>
          </div>
        </>
      )}
      <div className="ec-diagram-label">both nodes finalize — on different blocks</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ss-anim-svg">
        {/* H1 node — finalized B1 */}
        <circle cx={H1.x} cy={H1.y} r={36} fill="var(--toggle-bg)" stroke="var(--highlight-color)" strokeWidth={2} />
        <text
          x={H1.x} y={H1.y - 6}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={14}
          fontWeight={600}
          fill="var(--text-color)"
        >
          H₁
        </text>
        <text
          x={H1.x} y={H1.y + 14}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={11}
          fontWeight={700}
          fill="var(--highlight-color)"
        >
          ✓ B₁
        </text>
        <text
          x={H1.x} y={H1.y + 56}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={10}
          fill="var(--highlight-color)"
          opacity={0.8}
        >
          finalized
        </text>

        {/* H2 node — finalized B2 */}
        <circle cx={H2.x} cy={H2.y} r={36} fill="var(--toggle-bg)" stroke="var(--highlight-color)" strokeWidth={2} />
        <text
          x={H2.x} y={H2.y - 6}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={14}
          fontWeight={600}
          fill="var(--text-color)"
        >
          H₂
        </text>
        <text
          x={H2.x} y={H2.y + 14}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={11}
          fontWeight={700}
          fill="var(--highlight-color)"
        >
          ✓ B₂
        </text>
        <text
          x={H2.x} y={H2.y + 56}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={10}
          fill="var(--highlight-color)"
          opacity={0.8}
        >
          finalized
        </text>

        {/* Safety violation label */}
        <text
          x={cx} y={H1.y + 80}
          textAnchor="middle"
          fontFamily="'SFMono', monospace"
          fontSize={12}
          fontWeight={700}
          fill="#e74c3c"
        >
          safety violation — two honest nodes disagree
        </text>
      </svg>
    </div>
  );
}

export default function ConsensusMechanisms() {
  const [showSyncNote, setShowSyncNote] = useState(false);

  return (
    <div className="essay-container">
      <div className="ec-tabs">
        <button className="ec-tab ec-tab-active" type="button" aria-current="page">
          3f+1
        </button>
        <a
          className="ec-tab"
          href={MINIMMIT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          minimmit
        </a>
      </div>

      <p>
        <strong style={{ color: 'var(--highlight-color)' }}>n &ge; 3f + 1</strong> or <strong style={{ color: 'var(--highlight-color)' }}>f &lt; 33% of n</strong> represents
        the maximum proportion of faulty nodes (<em>f</em>) that can be tolerated to reach consensus under partial
        synchrony<span className="cm-info-btn-inline" onClick={() => setShowSyncNote(!showSyncNote)}>?</span>. This is the bound most modern proof of stake blockchains are designed around.
        But why is this the bound? Why would <strong style={{ color: 'var(--highlight-color)' }}>f = 33% of n</strong> fail?
      </p>

      {showSyncNote && (
        <>
          <div
            onClick={() => setShowSyncNote(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px 24px',
            fontSize: 14,
            lineHeight: 1.8,
            color: 'var(--text-color)',
            background: 'var(--bg-color)',
            border: '1px solid var(--toggle-border)',
            borderRadius: 6,
            maxWidth: 480,
            zIndex: 1000,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Consensus Communication Modes</div>
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--highlight-color)' }}>Synchrony:</strong> For any message sent, the
              adversary can delay its delivery by at most &Delta;, which is a known finite time bound.
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--highlight-color)' }}>Asynchrony:</strong> For any message sent, the
              adversary can delay its delivery by any finite amount of time. There is no delivery bound, but every
              message must eventually be delivered.
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--highlight-color)' }}>Partial Synchrony:</strong> Pre-GST, the
              communication model is asynchrony. Post-GST, synchrony.{' '}
              <a href="https://decentralizedthoughts.github.io/2019-06-01-2019-5-31-models/" target="_blank" rel="noopener noreferrer">
                Learn more here
              </a>.
            </div>
            <div
              onClick={() => setShowSyncNote(false)}
              style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'right', opacity: 0.6 }}
            >
              close
            </div>
          </div>
        </>
      )}

      <ByzantineDiagram />
      <FinalizationDiagram />
    </div>
  );
}
