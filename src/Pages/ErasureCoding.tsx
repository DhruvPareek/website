import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import '../Styling/ErasureCoding.css';
import '../Styling/Essay.css';

// ── Step reveal animation ────────────────────────────────

function Step({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`ec-step ${visible ? 'ec-step-visible' : ''}`}>
      {children}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

const SUP: Record<number, string> = { 2: '\u00B2', 3: '\u00B3', 4: '\u2074' };
const SUB = ['\u2080','\u2081','\u2082','\u2083','\u2084','\u2085','\u2086','\u2087'];

function evalPoly(c: number[], x: number): number {
  return c.reduce((s, ci, i) => s + ci * Math.pow(x, i), 0);
}

function toBin(n: number): string {
  return n.toString(2).padStart(4, '0');
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

function lagrangeCoeffs(ys: number[]): number[] {
  const n = ys.length;
  const coeffs = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let basis = [1];
    let denom = 1;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const nb = new Array(basis.length + 1).fill(0);
      for (let k = 0; k < basis.length; k++) {
        nb[k] += basis[k] * (-j);
        nb[k + 1] += basis[k];
      }
      basis = nb;
      denom *= (i - j);
    }
    const scale = ys[i] / denom;
    for (let k = 0; k < basis.length; k++) {
      coeffs[k] += basis[k] * scale;
    }
  }
  return coeffs.map(v => Math.round(v * 1e6) / 1e6);
}

// ── Parity Check Visualization ──────────────────────────

const P_DATA = [3, 7, 5, 9];
const P_VAL = P_DATA.reduce((a, b) => a ^ b, 0);
const P_ALL = [...P_DATA, P_VAL];
const P_ERASE = 2; // erase d₂ (value 5)
const P_REMAINING = P_ALL.filter((_, i) => i !== P_ERASE);
const P_RECOVERED = P_REMAINING.reduce((a, b) => a ^ b, 0);

const PAR_STEPS = 6;
const PAR_MS = 1400;

function ParityCheckViz() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(s => (s + 1) % PAR_STEPS), PAR_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ec-overview-diagram">
      <div className={`ec-ov-step ${active === 0 ? 'ec-ov-active' : active > 0 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-label">data symbols (k = 4)</div>
        <div className="ec-diagram-row">
          {P_DATA.map((val, i) => (
            <div key={i} className="ec-diagram-box ec-diagram-msg">
              <div className="ec-diagram-box-inner">
                <span className="ec-diagram-box-label">d{SUB[i]}</span>
                <span>{val}</span>
                <span className="ec-diagram-box-bin">{toBin(val)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 1 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; XOR all data symbols</span>
      </div>

      <div className={`ec-ov-step ${active === 1 ? 'ec-ov-active' : active > 1 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-computation">
          {P_DATA.map((v, i) => (
            <span key={i}>{i > 0 ? ' \u2295 ' : ''}{v}</span>
          ))}
          {' = '}<span className="ec-hl">{P_VAL}</span>
        </div>
        <div className="ec-diagram-label">codeword (n = k + 1 = 5)</div>
        <div className="ec-diagram-row">
          {P_ALL.map((val, i) => {
            const isParity = i === P_DATA.length;
            return (
              <div key={i} className={`ec-diagram-box ${isParity ? 'ec-diagram-parity' : 'ec-diagram-msg'}`}>
                <div className="ec-diagram-box-inner">
                  <span className="ec-diagram-box-label">{isParity ? 'P' : `d${SUB[i]}`}</span>
                  <span>{val}</span>
                  <span className="ec-diagram-box-bin">{toBin(val)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 2 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; symbol d{SUB[P_ERASE]} lost</span>
      </div>

      <div className={`ec-ov-step ${active === 2 ? 'ec-ov-active' : active > 2 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-label">received</div>
        <div className="ec-diagram-row">
          {P_ALL.map((val, i) => {
            const isParity = i === P_DATA.length;
            const erased = i === P_ERASE;
            return (
              <div key={i} className={`ec-diagram-box ${erased ? 'ec-diagram-erased' : isParity ? 'ec-diagram-parity' : 'ec-diagram-msg'}`}>
                <div className="ec-diagram-box-inner">
                  <span className="ec-diagram-box-label">{isParity ? 'P' : `d${SUB[i]}`}</span>
                  <span>{erased ? '?' : val}</span>
                  <span className="ec-diagram-box-bin">{erased ? '????' : toBin(val)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 3 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; XOR remaining symbols</span>
      </div>

      <div className={`ec-ov-step ${active === 3 ? 'ec-ov-active' : active > 3 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-computation">
          {P_REMAINING.map((v, i) => (
            <span key={i}>{i > 0 ? ' \u2295 ' : ''}{v}</span>
          ))}
          {' = '}<span className="ec-hl">{P_RECOVERED}</span>
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 4 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; recover</span>
      </div>

      <div className={`ec-ov-step ${active === 4 ? 'ec-ov-active' : active > 4 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-label">codeword</div>
        <div className="ec-diagram-row">
          {P_ALL.map((val, i) => {
            const isParity = i === P_DATA.length;
            const wasErased = i === P_ERASE;
            return (
              <div key={i} className={`ec-diagram-box ${wasErased ? 'ec-diagram-recovered' : isParity ? 'ec-diagram-parity' : 'ec-diagram-msg'}`}>
                <div className="ec-diagram-box-inner">
                  <span className="ec-diagram-box-label">{isParity ? 'P' : `d${SUB[i]}`}</span>
                  <span>{val}</span>
                  <span className="ec-diagram-box-bin">{toBin(val)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Reed-Solomon Visualization ──────────────────────────

const RS_MSGS: Record<number, number[]> = {
  2: [2, 3],
  3: [1, 2, 1],
  4: [1, 0, 1, 0],
};

function RSEvalLine({ coeffs, x }: { coeffs: number[]; x: number }) {
  const substituted = coeffs.map((c, i) => {
    if (i === 0) return `${c}`;
    const cStr = c === 0 ? '0' : c === 1 ? '' : c === -1 ? '-' : `${c}`;
    const xPart = i === 1 ? `(${x})` : `(${x}${SUP[i] || '^' + i})`;
    return c === 0 ? '0' : `${cStr}${xPart}`;
  }).join(' + ').replace(/\+ -/g, '- ');

  const products = coeffs.map((c, i) => c * Math.pow(x, i));
  const productsStr = products.join(' + ');
  const result = evalPoly(coeffs, x);

  return (
    <div className="ec-eval-line ec-active">
      p({x}) = {substituted} = {productsStr} = <span className="ec-hl">{result}</span>
    </div>
  );
}

type PolyGraphProps = {
  coeffs: number[];
  xs: number[];
  cw: number[];
  showCurve?: boolean;
  showPoints?: boolean;
  eraseSet?: Set<number>;
};

function PolyGraph({ coeffs, xs, cw, showCurve = true, showPoints = true, eraseSet }: PolyGraphProps) {
  const W = 320;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const xMin = -0.3;
  const xMax = Math.max(...xs) + 0.3;
  const yMin = Math.min(0, ...cw) - 1;
  const yMax = Math.max(...cw) + 1;

  const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  // Curve samples
  const curvePoints: string[] = [];
  if (showCurve) {
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalPoly(coeffs, x);
      curvePoints.push(`${toSvgX(x)},${toSvgY(y)}`);
    }
  }

  // Y-axis ticks
  const yTicks: number[] = [];
  const yStep = Math.max(1, Math.ceil((yMax - yMin) / 5));
  for (let v = Math.ceil(yMin); v <= yMax; v += yStep) {
    yTicks.push(v);
  }

  return (
    <svg className="ec-poly-graph" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} className="ec-graph-axis" />
      <line x1={pad.left} y1={toSvgY(0)} x2={pad.left + plotW} y2={toSvgY(0)} className="ec-graph-axis" />

      {/* Y ticks */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pad.left - 3} y1={toSvgY(v)} x2={pad.left} y2={toSvgY(v)} className="ec-graph-axis" />
          <text x={pad.left - 6} y={toSvgY(v) + 3.5} className="ec-graph-tick" textAnchor="end">{v}</text>
        </g>
      ))}

      {/* X ticks */}
      {xs.map(x => (
        <g key={x}>
          <line x1={toSvgX(x)} y1={toSvgY(0) - 3} x2={toSvgX(x)} y2={toSvgY(0) + 3} className="ec-graph-axis" />
          <text x={toSvgX(x)} y={H - pad.bottom + 18} className="ec-graph-tick" textAnchor="middle">{x}</text>
        </g>
      ))}

      {/* Curve */}
      {showCurve && <polyline points={curvePoints.join(' ')} className="ec-graph-curve" />}

      {/* Points */}
      {showPoints && xs.map((x, i) => {
        const erased = eraseSet?.has(i);
        return (
          <g key={x}>
            {!erased && (
              <>
                <line x1={toSvgX(x)} y1={toSvgY(0)} x2={toSvgX(x)} y2={toSvgY(cw[i])} className="ec-graph-guide" />
                <circle cx={toSvgX(x)} cy={toSvgY(cw[i])} r={4} className="ec-graph-point" />
                <text x={toSvgX(x) + 7} y={toSvgY(cw[i]) + 4} className="ec-graph-point-label">{cw[i]}</text>
              </>
            )}
            {erased && (
              <>
                <line x1={toSvgX(x)} y1={toSvgY(0) - 8} x2={toSvgX(x)} y2={toSvgY(0) + 8} className="ec-graph-erased-mark" />
                <text x={toSvgX(x)} y={toSvgY(0) - 12} className="ec-graph-erased-label" textAnchor="middle">?</text>
              </>
            )}
          </g>
        );
      })}

      {/* Axis labels */}
      <text x={pad.left + plotW / 2} y={H - 2} className="ec-graph-axis-label" textAnchor="middle">x</text>
      <text x={12} y={pad.top + plotH / 2} className="ec-graph-axis-label" textAnchor="middle" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>p(x)</text>
    </svg>
  );
}

function ReedSolomonViz() {
  const [k, setK] = useState(2);
  const [n, setN] = useState(4);

  useEffect(() => {
    if (n <= k) setN(k + 1);
  }, [k, n]);

  const coeffs = RS_MSGS[k];
  const xs = Array.from({ length: n }, (_, i) => i);
  const cw = xs.map(x => evalPoly(coeffs, x));

  const eraseCount = n - k;
  const eraseSet = new Set(Array.from({ length: eraseCount }, (_, i) => i + 1));
  const survivingXs = xs.filter(x => !eraseSet.has(x));
  const survivingPoints = survivingXs.map(x => `(${x}, ${cw[x]})`);

  return (
    <div className="ec-overview-diagram">
      <div className="ec-controls">
        <label>
          k ={' '}
          <select value={k} onChange={e => setK(Number(e.target.value))}>
            {[2, 3, 4].map(v => <option key={v} value={v}>{v}</option>)}
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

      <Step delay={0}>
        <div className="ec-diagram-label">message</div>
        <div className="ec-diagram-row">
          {coeffs.map((c, i) => (
            <div key={i} className="ec-diagram-box ec-diagram-msg">
              <div className="ec-diagram-box-inner">
                <span className="ec-diagram-box-label">m{SUB[i]}</span>
                <span>{c}</span>
              </div>
            </div>
          ))}
        </div>
      </Step>

      <Step delay={150}>
        <div className="ec-diagram-arrow">&darr; map to polynomial</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-diagram-poly">p(x) = {fmtPoly(coeffs)}</div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">polynomial</div>
            <PolyGraph coeffs={coeffs} xs={xs} cw={cw} showCurve={true} showPoints={false} />
          </div>
        </div>
      </Step>

      <Step delay={300}>
        <div className="ec-diagram-arrow">&darr; evaluate at n = {n} points</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-evals">
              {xs.map(x => <RSEvalLine key={x} coeffs={coeffs} x={x} />)}
            </div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">evaluated points</div>
            <PolyGraph coeffs={coeffs} xs={xs} cw={cw} showCurve={true} showPoints={true} />
          </div>
        </div>
      </Step>

      <Step delay={450}>
        <div className="ec-diagram-arrow">&darr; {eraseCount} symbol{eraseCount > 1 ? 's' : ''} lost</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-diagram-label">codeword ({n} symbols)</div>
            <div className="ec-diagram-row">
              {cw.map((val, i) => (
                <div key={i} className="ec-diagram-box ec-diagram-msg">
                  <div className="ec-diagram-box-inner">
                    <span className="ec-diagram-box-label">p({i})</span>
                    <span>{val}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ec-diagram-arrow">&darr;</div>
            <div className="ec-diagram-label">received</div>
            <div className="ec-diagram-row">
              {cw.map((val, i) => {
                const erased = eraseSet.has(i);
                return (
                  <div key={i} className={`ec-diagram-box ${erased ? 'ec-diagram-erased' : 'ec-diagram-msg'}`}>
                    <div className="ec-diagram-box-inner">
                      <span className="ec-diagram-box-label">p({i})</span>
                      <span>{erased ? '?' : val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">after transport</div>
            <PolyGraph coeffs={coeffs} xs={xs} cw={cw} showCurve={false} showPoints={true} eraseSet={eraseSet} />
          </div>
        </div>
      </Step>

      <Step delay={600}>
        <div className="ec-diagram-arrow">&darr; any {k} points determine a degree-{k - 1} polynomial</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-diagram-computation">
              surviving: {survivingPoints.join(', ')} &rarr; p(x) = {fmtPoly(coeffs)}
            </div>
            <div className="ec-diagram-arrow">&darr; coefficients = message</div>
            <div className="ec-diagram-label">recovered message</div>
            <div className="ec-diagram-row">
              {coeffs.map((c, i) => (
                <div key={i} className="ec-diagram-box ec-diagram-recovered">
                  <div className="ec-diagram-box-inner">
                    <span className="ec-diagram-box-label">m{SUB[i]}</span>
                    <span>{c}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">reconstructed</div>
            <PolyGraph coeffs={coeffs} xs={xs} cw={cw} showCurve={true} showPoints={true} eraseSet={eraseSet} />
          </div>
        </div>
      </Step>
    </div>
  );
}

// ── Systematic Reed-Solomon Visualization ───────────────

const SYS_MSGS: Record<number, number[]> = {
  2: [3, 7],
  3: [1, 3, 7],
  4: [1, 2, 5, 10],
};

function SystematicRSViz() {
  const [k, setK] = useState(2);
  const [n, setN] = useState(4);

  useEffect(() => {
    if (n <= k) setN(k + 1);
  }, [k, n]);

  const msg = SYS_MSGS[k];
  const polyCoeffs = lagrangeCoeffs(msg);
  const redundantXs = Array.from({ length: n - k }, (_, i) => k + i);
  const redundant = redundantXs.map(x => Math.round(evalPoly(polyCoeffs, x)));
  const cw = [...msg, ...redundant];
  const allXs = Array.from({ length: n }, (_, i) => i);

  const eraseCount = n - k;
  const eraseSet = new Set(Array.from({ length: eraseCount }, (_, i) => i));
  const survivingIndices = Array.from({ length: n }, (_, i) => i).filter(i => !eraseSet.has(i));
  const survivingPoints = survivingIndices.map(i => `(${i}, ${cw[i]})`);

  return (
    <div className="ec-overview-diagram">
      <div className="ec-controls">
        <label>
          k ={' '}
          <select value={k} onChange={e => setK(Number(e.target.value))}>
            {[2, 3, 4].map(v => <option key={v} value={v}>{v}</option>)}
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
        <span className="ec-info">message symbols preserved in codeword</span>
      </div>

      <Step delay={0}>
        <div className="ec-diagram-label">message ({k} symbols)</div>
        <div className="ec-diagram-row">
          {msg.map((v, i) => (
            <div key={i} className="ec-diagram-box ec-diagram-msg">
              <div className="ec-diagram-box-inner">
                <span className="ec-diagram-box-label">m{SUB[i]}</span>
                <span>{v}</span>
              </div>
            </div>
          ))}
        </div>
      </Step>

      <Step delay={150}>
        <div className="ec-diagram-arrow">&darr; treat as evaluations at x = 0..{k - 1}</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-diagram-computation">
              {msg.map((v, i) => (
                <span key={i}>{i > 0 ? ',  ' : ''}p({i}) = {v}</span>
              ))}
            </div>
            <div className="ec-diagram-arrow">&darr; find polynomial through {k} points</div>
            <div className="ec-diagram-poly">p(x) = {fmtPoly(polyCoeffs)}</div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">message as points</div>
            <PolyGraph coeffs={polyCoeffs} xs={allXs} cw={cw} showCurve={true} showPoints={true} eraseSet={new Set(redundantXs)} />
          </div>
        </div>
      </Step>

      <Step delay={300}>
        <div className="ec-diagram-arrow">&darr; evaluate at {n - k} additional point{n - k > 1 ? 's' : ''}</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-evals">
              {redundantXs.map(x => {
                const result = Math.round(evalPoly(polyCoeffs, x));
                const substituted = polyCoeffs.map((c, i) => {
                  if (i === 0) return `${c}`;
                  if (Math.abs(c) < 1e-9) return '0';
                  const cStr = c === 1 ? '' : c === -1 ? '-' : `${c}`;
                  const xPart = i === 1 ? `(${x})` : `(${x}${SUP[i] || '^' + i})`;
                  return `${cStr}${xPart}`;
                }).join(' + ').replace(/\+ -/g, '- ');
                return (
                  <div key={x} className="ec-eval-line ec-active">
                    p({x}) = {substituted} = <span className="ec-hl">{result}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">all points</div>
            <PolyGraph coeffs={polyCoeffs} xs={allXs} cw={cw} showCurve={true} showPoints={true} />
          </div>
        </div>
      </Step>

      <Step delay={450}>
        <div className="ec-diagram-arrow">&darr; {eraseCount} symbol{eraseCount > 1 ? 's' : ''} lost</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-diagram-label">codeword &mdash; first k values are the original message</div>
            <div className="ec-diagram-row">
              {cw.map((val, i) => {
                const isMsg = i < k;
                return (
                  <span key={i} style={{ display: 'contents' }}>
                    {i === k && <div className="ec-divider">|</div>}
                    <div className={`ec-diagram-box ${isMsg ? 'ec-diagram-selected' : 'ec-diagram-msg'}`}>
                      <div className="ec-diagram-box-inner">
                        <span className="ec-diagram-box-label">{isMsg ? `m${SUB[i]}` : `r${SUB[i - k]}`}</span>
                        <span>{val}</span>
                      </div>
                    </div>
                  </span>
                );
              })}
            </div>
            <div className="ec-diagram-arrow">&darr;</div>
            <div className="ec-diagram-label">received</div>
            <div className="ec-diagram-row">
              {cw.map((val, i) => {
                const erased = eraseSet.has(i);
                return (
                  <span key={i} style={{ display: 'contents' }}>
                    {i === k && <div className="ec-divider">|</div>}
                    <div className={`ec-diagram-box ${erased ? 'ec-diagram-erased' : 'ec-diagram-msg'}`}>
                      <div className="ec-diagram-box-inner">
                        <span className="ec-diagram-box-label">{i < k ? `m${SUB[i]}` : `r${SUB[i - k]}`}</span>
                        <span>{erased ? '?' : val}</span>
                      </div>
                    </div>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">after transport</div>
            <PolyGraph coeffs={polyCoeffs} xs={allXs} cw={cw} showCurve={false} showPoints={true} eraseSet={eraseSet} />
          </div>
        </div>
      </Step>

      <Step delay={600}>
        <div className="ec-diagram-arrow">&darr; any {k} points recover the polynomial</div>
        <div className="ec-rs-row">
          <div className="ec-rs-left">
            <div className="ec-diagram-computation">
              surviving: {survivingPoints.join(', ')} &rarr; p(x) = {fmtPoly(polyCoeffs)}
            </div>
            <div className="ec-diagram-arrow">&darr; evaluate at x = 0..{k - 1}</div>
            <div className="ec-diagram-label">recovered message</div>
            <div className="ec-diagram-row">
              {msg.map((v, i) => (
                <div key={i} className="ec-diagram-box ec-diagram-recovered">
                  <div className="ec-diagram-box-inner">
                    <span className="ec-diagram-box-label">m{SUB[i]}</span>
                    <span>{v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ec-rs-right">
            <div className="ec-graph-stage-label">reconstructed</div>
            <PolyGraph coeffs={polyCoeffs} xs={allXs} cw={cw} showCurve={true} showPoints={true} eraseSet={eraseSet} />
          </div>
        </div>
      </Step>
    </div>
  );
}

// ── Overview Animated Diagram ────────────────────────────

const OV_STEPS = 6;
const OV_MS = 1400;

function OverviewDiagram() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(s => (s + 1) % OV_STEPS), OV_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ec-overview-diagram">
      <div className={`ec-ov-step ${active === 0 ? 'ec-ov-active' : active > 0 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-label">message (k=4 symbols)</div>
        <div className="ec-diagram-row">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="ec-diagram-box ec-diagram-msg">{`m${SUB[i]}`}</div>
          ))}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 1 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; encode</span>
      </div>

      <div className={`ec-ov-step ${active === 1 ? 'ec-ov-active' : active > 1 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-label">codeword (n=6 symbols)</div>
        <div className="ec-diagram-row">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="ec-diagram-box ec-diagram-cw">{`c${SUB[i]}`}</div>
          ))}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 2 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; transport (some symbols lost)</span>
      </div>

      <div className={`ec-ov-step ${active === 2 ? 'ec-ov-active' : active > 2 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-row">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`ec-diagram-box ec-diagram-cw ${i === 1 || i === 3 ? 'ec-diagram-erased' : 'ec-diagram-selected'}`}>
              {i === 1 || i === 3 ? '?' : `c${SUB[i]}`}
            </div>
          ))}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 3 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; select k=4 surviving symbols</span>
      </div>

      <div className={`ec-ov-step ${active === 3 ? 'ec-ov-active' : active > 3 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-row">
          {[0, 2, 4, 5].map(i => (
            <div key={i} className="ec-diagram-box ec-diagram-selected">{`c${SUB[i]}`}</div>
          ))}
        </div>
      </div>

      <div className={`ec-ov-arrow ${active >= 4 ? 'ec-ov-arrow-active' : ''}`}>
        <span>&darr; decode</span>
      </div>

      <div className={`ec-ov-step ${active === 4 ? 'ec-ov-active' : active > 4 ? 'ec-ov-done' : ''}`}>
        <div className="ec-diagram-label">recovered message</div>
        <div className="ec-diagram-row">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="ec-diagram-box ec-diagram-recovered">{`m${SUB[i]}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────

type Tab = 'overview' | 'parity' | 'reed-solomon' | 'systematic';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'parity', label: 'Parity Check' },
  { id: 'reed-solomon', label: 'Reed-Solomon' },
  { id: 'systematic', label: 'Systematic RS' },
];

function ErasureCoding() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="essay-container">
      <p className="essay-title">Erasure Coding</p>
      <p className="date">March 2026</p>

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

      {tab === 'overview' && (
        <>
          <p>
            Erasure coding is where a sender adds extra "backup" information to a
            message to allow a receiver to reconstruct the message in case any part
            gets dropped.
          </p>
          <div className="ec-intro-defs">
            <div>Transform a message of <strong>k</strong> symbols into a codeword of <strong>n</strong> symbols</div>
            <div>The original message can be recovered from a subset of the <strong>n</strong> symbols</div>
          </div>

          <OverviewDiagram />
        </>
      )}

      {tab === 'parity' && (
        <>
          <p>
            n = k + 1. XOR all k data symbols to produce a single parity symbol.
            If any one of the k + 1 values is erased, XOR the remaining values to recover it.
            RAID5 is a widely used application of this.
          </p>
          <ParityCheckViz />
        </>
      )}

      {tab === 'reed-solomon' && (
        <>
          <p>
            The most common erasure code in storage systems.
            The key idea: any polynomial of degree k &minus; 1 is uniquely determined by any k points on it.
          </p>
          <p>
            The k message symbols become coefficients of a polynomial p(x).
            Evaluate p(x) at n fixed values of x to produce the codeword.
            The receiver can use any k values from the codeword to re-derive the polynomial
            and thus recover the message.
          </p>
          <ReedSolomonViz />
        </>
      )}

      {tab === 'systematic' && (
        <>
          <p>
            Standard Reed-Solomon produces a codeword where every symbol differs from the original message.
            A systematic code preserves the original message symbols in the codeword, appending
            only the redundant symbols. The message symbols are treated as evaluations of p(x) at agreed-upon
            values of x, the polynomial is derived from these points, and then evaluated at additional
            x-values to create redundancy.
          </p>
          <SystematicRSViz />
        </>
      )}
    </div>
  );
}

export default ErasureCoding;
