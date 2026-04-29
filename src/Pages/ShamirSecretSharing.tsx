import { useState, useEffect } from 'react';
import '../Styling/ErasureCoding.css';
import '../Styling/Essay.css';

// ── Helpers ──────────────────────────────────────────────

const SUP: Record<number, string> = { 2: '\u00B2', 3: '\u00B3', 4: '\u2074' };
const SUB = ['\u2080','\u2081','\u2082','\u2083','\u2084','\u2085','\u2086','\u2087'];

function evalPoly(c: number[], x: number): number {
  return c.reduce((s, ci, i) => s + ci * Math.pow(x, i), 0);
}

function fmtPoly(c: number[]): string {
  const parts: string[] = [];
  c.forEach((ci, i) => {
    if (ci === 0 && i > 0) return;
    if (i === 0) { parts.push(`${ci}`); return; }
    const xp = i === 1 ? 'x' : `x${SUP[i] || '^' + i}`;
    if (ci === 1) parts.push(xp);
    else if (ci === -1) parts.push(`-${xp}`);
    else parts.push(`${ci}${xp}`);
  });
  return parts.join(' + ').replace(/\+ -/g, '- ');
}

function lagrangeCoeffs(points: [number, number][]): number[] {
  const n = points.length;
  const coeffs = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let basis = [1];
    let denom = 1;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const nb = new Array(basis.length + 1).fill(0);
      for (let k = 0; k < basis.length; k++) {
        nb[k] += basis[k] * (-points[j][0]);
        nb[k + 1] += basis[k];
      }
      basis = nb;
      denom *= (points[i][0] - points[j][0]);
    }
    const scale = points[i][1] / denom;
    for (let k = 0; k < basis.length; k++) {
      coeffs[k] += basis[k] * scale;
    }
  }
  return coeffs.map(v => Math.round(v * 1e6) / 1e6);
}

// ── Graph Component ─────────────────────────────────────

type GraphProps = {
  coeffs: number[];
  points: [number, number][];
  showCurve?: boolean;
  showPoints?: boolean;
  hiddenIndices?: Set<number>;
  showSecret?: boolean;
  secret?: number;
};

function SSGraph({ coeffs, points, showCurve = true, showPoints = true, hiddenIndices, showSecret, secret }: GraphProps) {
  const W = 320;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const allX = points.map(p => p[0]);
  const allY = points.map(p => p[1]);
  const xMin = -0.5;
  const xMax = Math.max(...allX) + 0.5;
  const yMin = Math.min(0, ...allY, secret ?? 0) - 1;
  const yMax = Math.max(...allY, secret ?? 0) + 1;

  const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const curvePoints: string[] = [];
  if (showCurve) {
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalPoly(coeffs, x);
      curvePoints.push(`${toSvgX(x)},${toSvgY(y)}`);
    }
  }

  const yTicks: number[] = [];
  const yStep = Math.max(1, Math.ceil((yMax - yMin) / 5));
  for (let v = Math.ceil(yMin); v <= yMax; v += yStep) yTicks.push(v);

  return (
    <svg className="ec-poly-graph" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <line x1={toSvgX(0)} y1={pad.top} x2={toSvgX(0)} y2={pad.top + plotH} className="ec-graph-axis" />
      <line x1={pad.left} y1={toSvgY(0)} x2={pad.left + plotW} y2={toSvgY(0)} className="ec-graph-axis" />

      {yTicks.map(v => {
        const hideLabel = showSecret && secret !== undefined && v === secret;
        return (
          <g key={v}>
            <line x1={toSvgX(0) - 3} y1={toSvgY(v)} x2={toSvgX(0)} y2={toSvgY(v)} className="ec-graph-axis" />
            {!hideLabel && (
              <text x={toSvgX(0) - 6} y={toSvgY(v) + 3.5} className="ec-graph-tick" textAnchor="end">{v}</text>
            )}
          </g>
        );
      })}

      {allX.map((x, i) => (
        <g key={`xt-${i}`}>
          <line x1={toSvgX(x)} y1={toSvgY(0) - 3} x2={toSvgX(x)} y2={toSvgY(0) + 3} className="ec-graph-axis" />
          <text x={toSvgX(x)} y={H - pad.bottom + 18} className="ec-graph-tick" textAnchor="middle">{x}</text>
        </g>
      ))}

      {showCurve && <polyline points={curvePoints.join(' ')} className="ec-graph-curve" />}

      {showPoints && points.map(([x, y], i) => {
        const hidden = hiddenIndices?.has(i);
        return (
          <g key={`p-${i}`}>
            {!hidden && (
              <>
                <line x1={toSvgX(x)} y1={toSvgY(0)} x2={toSvgX(x)} y2={toSvgY(y)} className="ec-graph-guide" />
                <circle cx={toSvgX(x)} cy={toSvgY(y)} r={4} className="ec-graph-point" />
                <text x={toSvgX(x) + 7} y={toSvgY(y) + 4} className="ec-graph-point-label">{y}</text>
              </>
            )}
            {hidden && (
              <text x={toSvgX(x)} y={toSvgY(0) - 12} className="ec-graph-erased-label" textAnchor="middle">?</text>
            )}
          </g>
        );
      })}

      {showSecret && secret !== undefined && (
        <g>
          <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(0)} y2={toSvgY(secret)} className="ec-graph-guide" />
          <circle cx={toSvgX(0)} cy={toSvgY(secret)} r={5} className="ss-graph-secret" />
          <text x={toSvgX(0) - 8} y={toSvgY(secret) + 4} className="ss-graph-secret-label" textAnchor="end">S={secret}</text>
        </g>
      )}

      <text x={pad.left + plotW / 2} y={H - 2} className="ec-graph-axis-label" textAnchor="middle">x</text>
      <text x={12} y={pad.top + plotH / 2} className="ec-graph-axis-label" textAnchor="middle" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>p(x)</text>
    </svg>
  );
}

// ── Config ───────────────────────────────────────────────

const SSS_CONFIGS: Record<number, { secret: number; coeffs: number[] }> = {
  2: { secret: 5, coeffs: [5, 2] },       // p(x) = 5 + 2x
  3: { secret: 3, coeffs: [3, 1, 1] },    // p(x) = 3 + x + x²
};

// ── Overview ─────────────────────────────────────────────

// Phases: 0=dealer+secret, 1=split shares, 2=distribute, 3=dealer gone, 4=k combine, 5=secret recovered, 6=pause
const OV_PHASES = 7;
const OV_PHASE_MS = 1800;

function ShamirOverview() {
  const n = 7;
  const k = 4;
  const selected = new Set([0, 2, 4, 6]); // indices of the k people who reconstruct
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % OV_PHASES), OV_PHASE_MS);
    return () => clearInterval(t);
  }, []);

  const W = 440;
  const H = 440;
  const cx = W / 2;
  const cy = H / 2;
  const R = 170; // circle radius for entities

  // Entity positions around the circle
  const entities = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), idx: i };
  });

  const dealerVisible = phase <= 2;
  const sharesAtCenter = phase === 1;
  const sharesFlying = phase === 2;
  const sharesHeld = phase >= 3;
  const kCombining = phase >= 4 && phase <= 5;
  const secretRecovered = phase === 5;

  const phaseLabels = [
    'Dealer holds the secret',
    'Dealer creates shares from the secret',
    'Dealer distributes shares',
    'Each entity holds one share',
    `${k} entities combine their shares`,
    'Secret reconstructed',
    '',
  ];

  return (
    <>
      <p>
        An algorithm for distributing private information among a group.
        The secret is divided into n shares which individually do not give any
        information about the secret, but any k of which can be used to recreate it.
      </p>
      <div className="ec-intro-defs">
        <div>Dealer sends <strong>n</strong> people each 1 share; any <strong>k</strong> of them can recreate the secret together</div>
      </div>

      <div className="ss-anim-container">
        <div className="ss-anim-label">{phaseLabels[phase]}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="ss-anim-svg">
          {/* Entity circles */}
          {entities.map((e, i) => {
            const isSelected = selected.has(i);
            const dimmed = kCombining && !isSelected;
            const glowing = kCombining && isSelected;
            return (
              <g key={i}>
                <circle
                  cx={e.x} cy={e.y} r={28}
                  className={`ss-entity ${dimmed ? 'ss-entity-dim' : ''} ${glowing ? 'ss-entity-glow' : ''}`}
                />
                <text x={e.x} y={e.y - 6} textAnchor="middle" className="ss-entity-label">P{SUB[i + 1]}</text>
                {/* Share dot on entity (once held) */}
                {sharesHeld && (
                  <circle cx={e.x} cy={e.y + 10} r={4} className={`ss-share-dot ${dimmed ? 'ss-share-dim' : ''}`} />
                )}
              </g>
            );
          })}

          {/* Dealer in center */}
          <g className={`ss-dealer ${!dealerVisible ? 'ss-dealer-gone' : ''}`}>
            <circle cx={cx} cy={cy} r={32} className="ss-dealer-circle" />
            <text x={cx} y={cy - 40} textAnchor="middle" className="ss-dealer-text">Dealer</text>
            <text x={cx} y={cy + 6} textAnchor="middle" className="ss-secret-text">S</text>
          </g>

          {/* Share particles at center (phase 1) */}
          {sharesAtCenter && entities.map((_, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const sr = 18;
            return (
              <circle
                key={`sc-${i}`}
                cx={cx + sr * Math.cos(angle)}
                cy={cy + sr * Math.sin(angle)}
                r={5}
                className="ss-share-particle"
              />
            );
          })}

          {/* Share particles flying outward (phase 2) */}
          {sharesFlying && entities.map((e, i) => (
            <circle
              key={`sf-${i}`}
              cx={e.x} cy={e.y}
              r={5}
              className="ss-share-particle ss-share-flying"
              style={{
                '--from-x': `${cx}px`,
                '--from-y': `${cy}px`,
                '--to-x': `${e.x}px`,
                '--to-y': `${e.y}px`,
              } as React.CSSProperties}
            />
          ))}

          {/* Lines from k entities to center during reconstruction */}
          {kCombining && entities.filter((_, i) => selected.has(i)).map((e, i) => (
            <line
              key={`rl-${i}`}
              x1={e.x} y1={e.y + 10} x2={cx} y2={cy}
              className="ss-recon-line"
            />
          ))}

          {/* Reconstructed secret in center (phase 5) */}
          {secretRecovered && (
            <g>
              <circle cx={cx} cy={cy} r={28} className="ss-recovered-circle" />
              <text x={cx} y={cy + 5} textAnchor="middle" className="ss-recovered-text">S</text>
            </g>
          )}
        </svg>
        <div className="ss-anim-params">
          <span><strong>n</strong> = {n} participants / secret shares</span>
          <span className="ss-anim-params-sep">&middot;</span>
          <span><strong>k</strong> = {k} needed to reconstruct</span>
        </div>
      </div>
    </>
  );
}

// ── Sharing Visualization ────────────────────────────────

function EvalLine({ coeffs, x }: { coeffs: number[]; x: number }) {
  const substituted = coeffs.map((c, i) => {
    if (i === 0) return `${c}`;
    const cStr = c === 0 ? '0' : c === 1 ? '' : c === -1 ? '-' : `${c}`;
    const xPart = i === 1 ? `(${x})` : `(${x}${SUP[i] || '^' + i})`;
    return c === 0 ? '0' : `${cStr}${xPart}`;
  }).join(' + ').replace(/\+ -/g, '- ');

  const products = coeffs.map((c, i) => c * Math.pow(x, i));
  const result = evalPoly(coeffs, x);

  return (
    <div className="ec-eval-line ec-active">
      p({x}) = {substituted} = {products.join(' + ')} = <span className="ec-hl">{result}</span>
    </div>
  );
}

const KEY_INSIGHT = 'Any polynomial of degree k \u2212 1 is uniquely defined by any k points on it';

function SharingViz() {
  const [k, setK] = useState(2);
  const [n, setN] = useState(4);

  useEffect(() => {
    if (n <= k) setN(k + 1);
  }, [k, n]);

  const { secret, coeffs } = SSS_CONFIGS[k];
  const shareXs = Array.from({ length: n }, (_, i) => i + 1);
  const shares: [number, number][] = shareXs.map(x => [x, evalPoly(coeffs, x)]);

  return (
    <div className="ec-overview-diagram">
      <div className="ec-intro-defs ss-key-insight">{KEY_INSIGHT}</div>
      <div className="ec-controls">
        <label>
          k ={' '}
          <select value={k} onChange={e => setK(Number(e.target.value))}>
            {[2, 3].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>
          n ={' '}
          <select value={n} onChange={e => setN(Number(e.target.value))}>
            {[1, 2, 3].map(d => (
              <option key={k + d} value={k + d}>{k + d}</option>
            ))}
          </select>
        </label>
        <span className="ec-info">threshold = {k} of {n}</span>
      </div>

      {/* Step 1: Secret */}
      <div className="ec-diagram-label">secret</div>
      <div className="ec-diagram-row">
        <div className="ec-diagram-box ss-diagram-secret">
          <div className="ec-diagram-box-inner">
            <span className="ec-diagram-box-label">S</span>
            <span>{secret}</span>
          </div>
        </div>
      </div>

      {/* Step 2: Create polynomial — graph with curve + secret point */}
      <div className="ec-diagram-arrow">&darr; create random polynomial of degree {k - 1} where p(0) = {secret}</div>
      <div className="ec-rs-row">
        <div className="ec-rs-left">
          <div className="ec-diagram-poly">p(x) = {fmtPoly(coeffs)}</div>
        </div>
        <div className="ec-rs-right">
          <div className="ec-graph-stage-label">polynomial</div>
          <SSGraph coeffs={coeffs} points={shares} showCurve={true} showPoints={false} showSecret={true} secret={secret} />
        </div>
      </div>

      {/* Step 3: Evaluate — graph with curve + share points */}
      <div className="ec-diagram-arrow">&darr; evaluate at x = 1..{n} to create {n} shares</div>
      <div className="ec-rs-row">
        <div className="ec-rs-left">
          <div className="ec-evals">
            {shareXs.map(x => <EvalLine key={x} coeffs={coeffs} x={x} />)}
          </div>
        </div>
        <div className="ec-rs-right">
          <div className="ec-graph-stage-label">shares on curve</div>
          <SSGraph coeffs={coeffs} points={shares} showCurve={true} showPoints={true} showSecret={true} secret={secret} />
        </div>
      </div>

      {/* Step 4: Distribute shares */}
      <div className="ec-diagram-arrow">&darr; distribute one share to each person</div>
      <div className="ec-diagram-row">
        {shares.map(([x, y], i) => (
          <div key={i} className="ec-diagram-box ec-diagram-msg">
            <div className="ec-diagram-box-inner">
              <span className="ec-diagram-box-label">person {i + 1}</span>
              <span>({x}, {y})</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ec-diagram-computation" style={{ marginTop: 12 }}>
        no individual share reveals any information about the secret
      </div>
    </div>
  );
}

// ── Reconstruction Visualization ─────────────────────────

function ReconstructionViz() {
  const [k, setK] = useState(2);
  const [n, setN] = useState(4);

  useEffect(() => {
    if (n <= k) setN(k + 1);
  }, [k, n]);

  const { secret, coeffs } = SSS_CONFIGS[k];
  const shareXs = Array.from({ length: n }, (_, i) => i + 1);
  const shares: [number, number][] = shareXs.map(x => [x, evalPoly(coeffs, x)]);

  // Pick k shares: every other one starting from index 0
  const selectedIndices = Array.from({ length: k }, (_, i) => i * 2).filter(i => i < n);
  // Fill remaining if needed
  while (selectedIndices.length < k) {
    for (let i = 0; i < n && selectedIndices.length < k; i++) {
      if (!selectedIndices.includes(i)) selectedIndices.push(i);
    }
  }
  const selectedShares = selectedIndices.map(i => shares[i]);
  const hiddenSet = new Set(shareXs.map((_, i) => i).filter(i => !selectedIndices.includes(i)));

  const recoveredCoeffs = lagrangeCoeffs(selectedShares);
  const recoveredSecret = Math.round(evalPoly(recoveredCoeffs, 0));

  return (
    <div className="ec-overview-diagram">
      <div className="ec-intro-defs ss-key-insight">{KEY_INSIGHT}</div>
      <div className="ec-controls">
        <label>
          k ={' '}
          <select value={k} onChange={e => setK(Number(e.target.value))}>
            {[2, 3].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label>
          n ={' '}
          <select value={n} onChange={e => setN(Number(e.target.value))}>
            {[1, 2, 3].map(d => (
              <option key={k + d} value={k + d}>{k + d}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Step 1: All shares — only selected visible */}
      <div className="ec-diagram-label">any {k} shares needed</div>
      <div className="ec-diagram-row">
        {shares.map(([x, y], i) => {
          const selected = selectedIndices.includes(i);
          return (
            <div key={i} className={`ec-diagram-box ${selected ? 'ec-diagram-selected' : 'ec-diagram-erased'}`}>
              <div className="ec-diagram-box-inner">
                <span className="ec-diagram-box-label">person {i + 1}</span>
                <span>{selected ? `(${x}, ${y})` : '?'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 2: Selected shares — points only, no curve */}
      <div className="ec-diagram-arrow">&darr; collect {k} shares</div>
      <div className="ec-rs-row">
        <div className="ec-rs-left">
          <div className="ec-diagram-label">selected shares</div>
          <div className="ec-diagram-row">
            {selectedShares.map(([x, y], i) => (
              <div key={i} className="ec-diagram-box ec-diagram-selected">
                <div className="ec-diagram-box-inner">
                  <span className="ec-diagram-box-label">share</span>
                  <span>({x}, {y})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ec-rs-right">
          <div className="ec-graph-stage-label">{k} points</div>
          <SSGraph coeffs={coeffs} points={shares} showCurve={false} showPoints={true} hiddenIndices={hiddenSet} />
        </div>
      </div>

      {/* Step 3: Interpolation — curve through selected points */}
      <div className="ec-diagram-arrow">&darr; {k} points determine a unique degree-{k - 1} polynomial</div>
      <div className="ec-rs-row">
        <div className="ec-rs-left">
          <div className="ec-diagram-computation">
            Lagrange interpolation: {selectedShares.map(([x, y]) => `(${x}, ${y})`).join(', ')}
          </div>
          <div className="ec-diagram-poly">p(x) = {fmtPoly(recoveredCoeffs)}</div>
        </div>
        <div className="ec-rs-right">
          <div className="ec-graph-stage-label">reconstructed curve</div>
          <SSGraph coeffs={coeffs} points={shares} showCurve={true} showPoints={true} hiddenIndices={hiddenSet} showSecret={true} secret={secret} />
        </div>
      </div>

      {/* Step 4: Recover secret */}
      <div className="ec-diagram-arrow">&darr; evaluate at x = 0</div>
      <div className="ec-rs-row">
        <div className="ec-rs-left">
          <div className="ec-diagram-computation">
            p(0) = {fmtPoly(recoveredCoeffs).replace(/x[^\s]*/g, '0')} = <span className="ec-hl">{recoveredSecret}</span>
          </div>
          <div className="ec-diagram-label">secret recovered</div>
          <div className="ec-diagram-row">
            <div className="ec-diagram-box ss-diagram-secret">
              <div className="ec-diagram-box-inner">
                <span className="ec-diagram-box-label">S</span>
                <span>{recoveredSecret}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="ec-rs-right">
          <div className="ec-graph-stage-label">secret = p(0)</div>
          <SSGraph coeffs={coeffs} points={shares} showCurve={true} showPoints={true} hiddenIndices={hiddenSet} showSecret={true} secret={recoveredSecret} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────

type Tab = 'overview' | 'sharing' | 'reconstruction';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sharing', label: 'Sharing' },
  { id: 'reconstruction', label: 'Reconstruction' },
];

function ShamirSecretSharing() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="essay-container">
      <p className="essay-title">Shamir Secret Sharing</p>

      <div className="ec-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ec-tab ${tab === t.id ? 'ec-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <ShamirOverview />}
      {tab === 'sharing' && <SharingViz />}
      {tab === 'reconstruction' && <ReconstructionViz />}
    </div>
  );
}

export default ShamirSecretSharing;
