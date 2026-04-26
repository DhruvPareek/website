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

// ── Solana Turbine: Block Split Visualization ───────────

const PIECE_COLORS = ['#44ddb5', '#5cb3e6', '#a78bfa', '#f59e0b', '#fb7185', '#84cc16'];

const SPLIT_PHASE_DURATIONS = [1500, 1500, 2400, 1800];

function BlockSplitViz() {
  const numNodes = 6;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setPhase(p => (p + 1) % 4),
      SPLIT_PHASE_DURATIONS[phase]
    );
    return () => clearTimeout(t);
  }, [phase]);

  const W = 540;
  const H = 290;
  const leader = { x: W / 2, y: 38 };
  const blockY = 78;
  const nodes = Array.from({ length: numNodes }, (_, i) => ({
    x: 50 + (i * (W - 100)) / (numNodes - 1),
    y: H - 70,
  }));

  const pw = 12;
  const ph = 28;
  const blockStartX = leader.x - (pw * numNodes) / 2;
  const blockTotalW = pw * numNodes;
  const mw = 4;
  const mh = 14;

  return (
    <div className="turbine-viz">
      <svg viewBox={`0 0 ${W} ${H}`} className="turbine-svg" preserveAspectRatio="xMidYMid meet">
        {(phase === 0 || phase === 1) &&
          nodes.map((p, i) => (
            <line
              key={`l-${i}`}
              x1={blockStartX + i * pw + pw / 2}
              y1={blockY + ph}
              x2={p.x}
              y2={p.y - 22}
              className={`turbine-line ${phase === 1 ? 'turbine-line-active' : ''}`}
            />
          ))}

        {phase === 2 && (
          <>
            <line
              x1={nodes[0].x}
              y1={nodes[0].y}
              x2={nodes[nodes.length - 1].x}
              y2={nodes[nodes.length - 1].y}
              className="turbine-peer-mesh"
            />
            {nodes.flatMap((src, i) =>
              nodes.map((dst, j) => {
                if (i === j) return null;
                const dx = dst.x - src.x;
                const dy = dst.y - src.y;
                const delay = ((i * 17 + j * 23) % 19) * 30;
                const duration = 1000 + ((i * 13 + j * 7) % 11) * 30;
                return (
                  <circle
                    key={`peer-particle-${i}-${j}`}
                    cx={src.x}
                    cy={src.y}
                    r={4}
                    fill={PIECE_COLORS[i]}
                    className="turbine-peer-particle"
                    style={
                      {
                        '--pdx': `${dx}px`,
                        '--pdy': `${dy}px`,
                        animationDelay: `${delay}ms`,
                        animationDuration: `${duration}ms`,
                      } as React.CSSProperties
                    }
                  />
                );
              })
            )}
          </>
        )}

        <circle cx={leader.x} cy={leader.y} r={22} className="turbine-leader" />
        <text x={leader.x} y={leader.y + 4} textAnchor="middle" className="turbine-leader-label">
          leader
        </text>

        {(phase === 0 || phase === 1) && (
          <g
            key={`block-frame-${phase}`}
            className={phase === 1 ? 'turbine-block-frame-fade' : ''}
          >
            <rect
              x={blockStartX - 1}
              y={blockY - 1}
              width={blockTotalW + 2}
              height={ph + 2}
              rx={3}
              fill="none"
              className="turbine-block-frame"
            />
          </g>
        )}

        {(phase === 0 || phase === 1) &&
          Array.from({ length: numNodes }, (_, i) => {
            const startX = blockStartX + i * pw;
            const endX = nodes[i].x - pw / 2;
            const endY = nodes[i].y - ph / 2;
            const dx = endX - startX;
            const dy = endY - blockY;

            return (
              <rect
                key={`piece-${phase}-${i}`}
                x={startX}
                y={blockY}
                width={pw}
                height={ph}
                fill={PIECE_COLORS[i]}
                className={phase === 1 ? 'turbine-piece-travel' : ''}
                style={
                  phase === 1
                    ? ({ '--end-x': `${dx}px`, '--end-y': `${dy}px` } as React.CSSProperties)
                    : {}
                }
              />
            );
          })}

        {nodes.map((p, i) => (
          <g key={`n-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={20}
              className={`turbine-node ${phase >= 2 ? 'turbine-node-active' : ''}`}
            />
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="turbine-node-label">
              N{SUB[i + 1]}
            </text>

            {phase === 2 && (
              <rect
                x={p.x - pw / 2}
                y={p.y + 26}
                width={pw}
                height={ph}
                fill={PIECE_COLORS[i]}
              />
            )}

            {phase === 3 && (
              <>
                <rect
                  x={p.x - (mw * numNodes) / 2 - 1}
                  y={p.y + 25}
                  width={mw * numNodes + 2}
                  height={mh + 2}
                  rx={2}
                  fill="none"
                  className="turbine-block-frame"
                />
                {Array.from({ length: numNodes }, (_, j) => (
                  <rect
                    key={`m-${i}-${j}`}
                    x={p.x - (mw * numNodes) / 2 + j * mw}
                    y={p.y + 26}
                    width={mw}
                    height={mh}
                    fill={PIECE_COLORS[j]}
                  />
                ))}
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Solana Turbine: Turbine Tree Visualization ──────────

const TURBINE_TREE_PHASE_DURATIONS = [1300, 1500, 1500, 1300, 1500, 900];

function TurbineTreeViz() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setPhase(p => (p + 1) % TURBINE_TREE_PHASE_DURATIONS.length),
      TURBINE_TREE_PHASE_DURATIONS[phase]
    );
    return () => clearTimeout(t);
  }, [phase]);

  const W = 540;
  const H = 320;
  const k = 2;
  const numShreds = 4;

  const leader = { x: W / 2, y: 30 };
  const blockY = 65;
  const pw = 12;
  const ph = 28;

  const shredsAtLeader = phase === 0 ? k : numShreds;
  const blockTotalW = pw * shredsAtLeader;
  const blockStartX = leader.x - blockTotalW / 2;

  const treeCenters = [70, 200, 340, 470];

  const trees = treeCenters.map((cx, i) => ({
    color: PIECE_COLORS[i],
    root: { x: cx, y: 158 },
    layer1: [
      { x: cx - 22, y: 218 },
      { x: cx + 22, y: 218 },
    ],
    layer2: [
      { x: cx - 33, y: 280, parent: 0 },
      { x: cx - 11, y: 280, parent: 0 },
      { x: cx + 11, y: 280, parent: 1 },
      { x: cx + 33, y: 280, parent: 1 },
    ],
  }));

  return (
    <div className="turbine-viz">
      <div className="turbine-erasure-layout">
        <svg viewBox={`0 0 ${W} ${H}`} className="turbine-svg" preserveAspectRatio="xMidYMid meet">
        {(phase === 0 || phase === 1 || phase === 2) &&
          trees.map((tree, t) => {
            if (phase === 0 && t >= k) return null;
            const startX = blockStartX + t * pw + pw / 2;
            return (
              <line
                key={`l-r-${t}`}
                x1={startX}
                y1={blockY + ph}
                x2={tree.root.x}
                y2={tree.root.y}
                className={`turbine-tree-edge ${phase === 2 ? 'turbine-tree-edge-active' : ''}`}
                style={
                  phase === 2
                    ? ({ '--tree-color': tree.color } as React.CSSProperties)
                    : {}
                }
              />
            );
          })}

        {trees.map((tree, t) => (
          <g
            key={`tree-edges-${t}`}
            style={{ '--tree-color': tree.color } as React.CSSProperties}
          >
            {tree.layer1.map((p, i) => (
              <line
                key={`r-l1-${i}`}
                x1={tree.root.x}
                y1={tree.root.y}
                x2={p.x}
                y2={p.y}
                className={`turbine-tree-edge ${phase === 3 ? 'turbine-tree-edge-active' : ''}`}
              />
            ))}
            {tree.layer2.map((p, i) => (
              <line
                key={`l1-l2-${i}`}
                x1={tree.layer1[p.parent].x}
                y1={tree.layer1[p.parent].y}
                x2={p.x}
                y2={p.y}
                className={`turbine-tree-edge ${phase === 4 ? 'turbine-tree-edge-active' : ''}`}
              />
            ))}
          </g>
        ))}

        {phase === 2 &&
          trees.map((tree, t) => {
            const startX = blockStartX + t * pw + pw / 2;
            const startY = blockY + ph;
            const dx = tree.root.x - startX;
            const dy = tree.root.y - startY;
            return (
              <circle
                key={`p2-${t}`}
                cx={startX}
                cy={startY}
                r={5}
                fill={tree.color}
                className="turbine-peer-particle"
                style={
                  {
                    '--pdx': `${dx}px`,
                    '--pdy': `${dy}px`,
                    animationDuration: '1.2s',
                    animationDelay: `${t * 40}ms`,
                  } as React.CSSProperties
                }
              />
            );
          })}

        {phase === 3 &&
          trees.flatMap((tree, t) =>
            tree.layer1.map((p, i) => {
              const dx = p.x - tree.root.x;
              const dy = p.y - tree.root.y;
              return (
                <circle
                  key={`p3-${t}-${i}`}
                  cx={tree.root.x}
                  cy={tree.root.y}
                  r={4}
                  fill={tree.color}
                  className="turbine-peer-particle"
                  style={
                    {
                      '--pdx': `${dx}px`,
                      '--pdy': `${dy}px`,
                      animationDuration: '1.0s',
                      animationDelay: `${i * 30}ms`,
                    } as React.CSSProperties
                  }
                />
              );
            })
          )}

        {phase === 4 &&
          trees.flatMap((tree, t) =>
            tree.layer2.map((p, i) => {
              const parent = tree.layer1[p.parent];
              const dx = p.x - parent.x;
              const dy = p.y - parent.y;
              return (
                <circle
                  key={`p4-${t}-${i}`}
                  cx={parent.x}
                  cy={parent.y}
                  r={4}
                  fill={tree.color}
                  className="turbine-peer-particle"
                  style={
                    {
                      '--pdx': `${dx}px`,
                      '--pdy': `${dy}px`,
                      animationDuration: '1.0s',
                      animationDelay: `${(i % 2) * 30}ms`,
                    } as React.CSSProperties
                  }
                />
              );
            })
          )}

        <circle cx={leader.x} cy={leader.y} r={20} className="turbine-leader" />
        <text x={leader.x} y={leader.y + 4} textAnchor="middle" className="turbine-leader-label">
          leader
        </text>

        {(phase === 0 || phase === 1) && (
          <rect
            x={blockStartX - 1}
            y={blockY - 1}
            width={blockTotalW + 2}
            height={ph + 2}
            rx={3}
            fill="none"
            className="turbine-block-frame"
          />
        )}

        {(phase === 0 || phase === 1) &&
          Array.from({ length: numShreds }, (_, i) => {
            if (phase === 0 && i >= k) return null;
            const startX = blockStartX + i * pw;
            const isParity = i >= k;
            const fadeIn = phase === 1 && isParity;
            return (
              <rect
                key={`piece-${phase}-${i}`}
                x={startX}
                y={blockY}
                width={pw}
                height={ph}
                fill={PIECE_COLORS[i]}
                className={fadeIn ? 'turbine-parity-fade-in' : ''}
              />
            );
          })}

        {trees.map((tree, t) => (
          <g
            key={`tree-nodes-${t}`}
            style={{ '--tree-color': tree.color } as React.CSSProperties}
          >
            <circle
              cx={tree.root.x}
              cy={tree.root.y}
              r={11}
              className={`turbine-tree-node ${phase >= 3 ? 'turbine-tree-node-active' : ''}`}
            />
            {tree.layer1.map((p, i) => (
              <circle
                key={`l1-${i}`}
                cx={p.x}
                cy={p.y}
                r={8}
                className={`turbine-tree-node ${phase >= 4 ? 'turbine-tree-node-active' : ''}`}
              />
            ))}
            {tree.layer2.map((p, i) => (
              <circle
                key={`l2-${i}`}
                cx={p.x}
                cy={p.y}
                r={6}
                className={`turbine-tree-node ${phase >= 5 ? 'turbine-tree-node-active' : ''}`}
              />
            ))}
          </g>
        ))}
        </svg>
        <ErasureGrid phase={phase >= 1 ? 1 : 0} dataRows={k} parityRows={numShreds - k} />
      </div>
    </div>
  );
}

// ── Solana Turbine: Erasure Coding Visualization ────────

const ERASURE_PHASE_DURATIONS = [1500, 1800, 1500, 1500, 2400, 1800];
const BAD_NODE_INDICES = new Set([1, 4]);

function ErasureGrid({
  phase,
  dataRows = 3,
  parityRows = 3,
}: {
  phase: number;
  dataRows?: number;
  parityRows?: number;
}) {
  const cols = 4;
  const cell = 14;

  const gridX = 6;
  const gridY = 22;
  const arrowH = 24;

  const dataH = dataRows * cell;
  const parityH = parityRows * cell;
  const gridW = cols * cell;

  const parityY = gridY + dataH + arrowH;
  const arrowCenterY = gridY + dataH + arrowH / 2;

  const totalW = gridW + 26;
  const totalH = gridY + dataH + arrowH + parityH + 16;
  const cx = gridX + gridW / 2;

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="turbine-erasure-grid"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={cx} y={14} textAnchor="middle" className="turbine-erasure-label">
        block
      </text>

      {Array.from({ length: dataRows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`d-${r}-${c}`}
            x={gridX + c * cell}
            y={gridY + r * cell}
            width={cell}
            height={cell}
            fill={PIECE_COLORS[r]}
            opacity={0.85}
            className="turbine-erasure-cell"
          />
        ))
      )}

      {phase >= 1 && (
        <g className={phase === 1 ? 'turbine-encoding-arrow-anim' : ''}>
          <line
            x1={cx}
            y1={arrowCenterY - 9}
            x2={cx}
            y2={arrowCenterY + 4}
            className="turbine-encoding-arrow"
          />
          <polygon
            points={`${cx - 5},${arrowCenterY + 2} ${cx + 5},${arrowCenterY + 2} ${cx},${arrowCenterY + 9}`}
            className="turbine-encoding-arrow-head"
          />
        </g>
      )}

      {phase >= 1 &&
        Array.from({ length: parityRows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <rect
              key={`p-${r}-${c}`}
              x={gridX + c * cell}
              y={parityY + r * cell}
              width={cell}
              height={cell}
              fill={PIECE_COLORS[dataRows + r]}
              opacity={0.85}
              className={`turbine-erasure-cell ${phase === 1 ? 'turbine-parity-fade-in' : ''}`}
            />
          ))
        )}

      {phase >= 1 && (
        <text x={cx} y={totalH - 4} textAnchor="middle" className="turbine-erasure-label">
          encoded
        </text>
      )}
    </svg>
  );
}

function ErasureCodeViz() {
  const k = 3;
  const numNodes = 6;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setPhase(p => (p + 1) % ERASURE_PHASE_DURATIONS.length),
      ERASURE_PHASE_DURATIONS[phase]
    );
    return () => clearTimeout(t);
  }, [phase]);

  const W = 540;
  const H = 290;
  const leader = { x: W / 2, y: 38 };
  const blockY = 78;
  const nodes = Array.from({ length: numNodes }, (_, i) => ({
    x: 50 + (i * (W - 100)) / (numNodes - 1),
    y: H - 70,
  }));

  const pw = 12;
  const ph = 28;
  const mw = 4;
  const mh = 14;

  const shredsAtLeader = phase === 0 ? k : numNodes;
  const blockTotalW = pw * shredsAtLeader;
  const blockStartX = leader.x - blockTotalW / 2;

  const survivingIndices = Array.from({ length: numNodes }, (_, i) => i).filter(
    i => !BAD_NODE_INDICES.has(i)
  );

  return (
    <div className="turbine-viz">
      <div className="turbine-erasure-layout">
        <svg viewBox={`0 0 ${W} ${H}`} className="turbine-svg" preserveAspectRatio="xMidYMid meet">
        {(phase === 0 || phase === 1 || phase === 2) &&
          Array.from({ length: numNodes }, (_, i) => {
            if (phase === 0 && i >= k) return null;
            const x1 = blockStartX + i * pw + pw / 2;
            return (
              <line
                key={`l-${i}`}
                x1={x1}
                y1={blockY + ph}
                x2={nodes[i].x}
                y2={nodes[i].y - 22}
                className={`turbine-line ${phase === 2 ? 'turbine-line-active' : ''}`}
              />
            );
          })}

        {phase === 4 && (
          <>
            <line
              x1={nodes[survivingIndices[0]].x}
              y1={nodes[survivingIndices[0]].y}
              x2={nodes[survivingIndices[survivingIndices.length - 1]].x}
              y2={nodes[survivingIndices[survivingIndices.length - 1]].y}
              className="turbine-peer-mesh"
            />
            {survivingIndices.flatMap(i =>
              survivingIndices.map(j => {
                if (i === j) return null;
                const src = nodes[i];
                const dst = nodes[j];
                const dx = dst.x - src.x;
                const dy = dst.y - src.y;
                const delay = ((i * 17 + j * 23) % 19) * 30;
                const duration = 1000 + ((i * 13 + j * 7) % 11) * 30;
                return (
                  <circle
                    key={`peer-${i}-${j}`}
                    cx={src.x}
                    cy={src.y}
                    r={4}
                    fill={PIECE_COLORS[i]}
                    className="turbine-peer-particle"
                    style={
                      {
                        '--pdx': `${dx}px`,
                        '--pdy': `${dy}px`,
                        animationDelay: `${delay}ms`,
                        animationDuration: `${duration}ms`,
                      } as React.CSSProperties
                    }
                  />
                );
              })
            )}
          </>
        )}

        <circle cx={leader.x} cy={leader.y} r={22} className="turbine-leader" />
        <text x={leader.x} y={leader.y + 4} textAnchor="middle" className="turbine-leader-label">
          leader
        </text>

        {(phase === 0 || phase === 1) && (
          <rect
            x={blockStartX - 1}
            y={blockY - 1}
            width={blockTotalW + 2}
            height={ph + 2}
            rx={3}
            fill="none"
            className="turbine-block-frame"
          />
        )}

        {(phase === 0 || phase === 1 || phase === 2) &&
          Array.from({ length: numNodes }, (_, i) => {
            if (phase === 0 && i >= k) return null;
            const startX = blockStartX + i * pw;
            const endX = nodes[i].x - pw / 2;
            const endY = nodes[i].y - ph / 2;
            const dx = endX - startX;
            const dy = endY - blockY;
            const isParity = i >= k;
            const fadeIn = phase === 1 && isParity;

            return (
              <rect
                key={`piece-${phase}-${i}`}
                x={startX}
                y={blockY}
                width={pw}
                height={ph}
                fill={PIECE_COLORS[i]}
                className={
                  phase === 2
                    ? 'turbine-piece-travel'
                    : fadeIn
                    ? 'turbine-parity-fade-in'
                    : ''
                }
                style={
                  phase === 2
                    ? ({ '--end-x': `${dx}px`, '--end-y': `${dy}px` } as React.CSSProperties)
                    : {}
                }
              />
            );
          })}

        {nodes.map((p, i) => {
          const isBad = BAD_NODE_INDICES.has(i);
          const showBadIndicator = isBad && phase >= 3;
          const showShred = phase === 3 || phase === 4 || (phase === 5 && isBad);
          const showReconstructed = phase === 5 && !isBad;

          return (
            <g key={`n-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={20}
                className={
                  showBadIndicator
                    ? 'turbine-node turbine-node-bad'
                    : phase >= 2
                    ? 'turbine-node turbine-node-active'
                    : 'turbine-node'
                }
              />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className="turbine-node-label">
                N{SUB[i + 1]}
              </text>

              {showShred && (
                <rect
                  x={p.x - pw / 2}
                  y={p.y + 26}
                  width={pw}
                  height={ph}
                  fill={PIECE_COLORS[i]}
                  opacity={isBad ? 0.35 : 1}
                />
              )}

              {showBadIndicator && showShred && (
                <g className="turbine-bad-x">
                  <line
                    x1={p.x - pw / 2 - 3}
                    y1={p.y + 24}
                    x2={p.x + pw / 2 + 3}
                    y2={p.y + 28 + ph}
                  />
                  <line
                    x1={p.x + pw / 2 + 3}
                    y1={p.y + 24}
                    x2={p.x - pw / 2 - 3}
                    y2={p.y + 28 + ph}
                  />
                </g>
              )}

              {showReconstructed && (
                <>
                  <rect
                    x={p.x - (mw * k) / 2 - 1}
                    y={p.y + 25}
                    width={mw * k + 2}
                    height={mh + 2}
                    rx={2}
                    fill="none"
                    className="turbine-block-frame"
                  />
                  {Array.from({ length: k }, (_, j) => (
                    <rect
                      key={`m-${i}-${j}`}
                      x={p.x - (mw * k) / 2 + j * mw}
                      y={p.y + 26}
                      width={mw}
                      height={mh}
                      fill={PIECE_COLORS[j]}
                    />
                  ))}
                </>
              )}
            </g>
          );
        })}
        </svg>
        <ErasureGrid phase={phase} />
      </div>
    </div>
  );
}

// ── Solana Turbine: Leader Broadcast Visualization ──────

function LeaderBroadcastViz() {
  const numNodes = 6;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => p + 1), 1400);
    return () => clearInterval(t);
  }, []);

  const W = 540;
  const H = 260;
  const leader = { x: W / 2, y: 50 };
  const nodes = Array.from({ length: numNodes }, (_, i) => ({
    x: 50 + (i * (W - 100)) / (numNodes - 1),
    y: H - 50,
  }));

  const currentNode = phase % numNodes;
  const target = nodes[currentNode];
  const dx = target.x - leader.x;
  const dy = target.y - leader.y;

  return (
    <div className="turbine-viz">
      <svg viewBox={`0 0 ${W} ${H}`} className="turbine-svg" preserveAspectRatio="xMidYMid meet">
        {nodes.map((p, i) => (
          <line
            key={i}
            x1={leader.x}
            y1={leader.y}
            x2={p.x}
            y2={p.y}
            className={`turbine-line ${i === currentNode ? 'turbine-line-active' : ''}`}
          />
        ))}

        <g
          key={phase}
          className="turbine-block-travel"
          style={{ '--end-x': `${dx}px`, '--end-y': `${dy}px` } as React.CSSProperties}
        >
          <rect
            x={leader.x - 10}
            y={leader.y - 7}
            width={20}
            height={14}
            rx={2}
            className="turbine-block"
          />
        </g>

        <circle cx={leader.x} cy={leader.y} r={28} className="turbine-leader" />
        <text x={leader.x} y={leader.y + 4} textAnchor="middle" className="turbine-leader-label">
          leader
        </text>

        {nodes.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={20}
              className={`turbine-node ${i === currentNode ? 'turbine-node-active' : ''}`}
            />
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="turbine-node-label">
              N{SUB[i + 1]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────

type Tab = 'overview' | 'parity' | 'reed-solomon' | 'systematic' | 'solana-turbine';
type TurbineTab = 'intro' | 'splitting' | 'erasure' | 'turbine';

const TURBINE_TABS: { id: TurbineTab; label: string }[] = [
  { id: 'intro', label: 'Intro' },
  { id: 'splitting', label: 'Shredding' },
  { id: 'erasure', label: 'Erasure Coding' },
  { id: 'turbine', label: 'Turbine' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'parity', label: 'Parity Check' },
  { id: 'reed-solomon', label: 'Reed-Solomon' },
  { id: 'systematic', label: 'Systematic RS' },
  { id: 'solana-turbine', label: 'Solana Turbine' },
];

function ErasureCoding() {
  const [tab, setTab] = useState<Tab>('overview');
  const [turbineTab, setTurbineTab] = useState<TurbineTab>('intro');

  return (
    <div className="essay-container">
      <p className="essay-title">Erasure Coding</p>

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

      {tab === 'solana-turbine' && (
        <div className="turbine-layout">
          <div className="turbine-sidebar">
            {TURBINE_TABS.map(t => (
              <button
                key={t.id}
                className={`turbine-vtab ${turbineTab === t.id ? 'turbine-vtab-active' : ''}`}
                onClick={() => setTurbineTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="turbine-content">
            {turbineTab === 'intro' && (
              <>
                <ul className="turbine-bullets">
                  <li>
                    In blockchains, the traditional mechanism for block dissemination from leader
                    to the rest of the network requires the leader to transmit the full proposed block
                    to several other nodes
                  </li>
                  <li>
                    This is very inefficient for the leader and is a very inefficient use of
                    the bandwidth of the network
                  </li>
                </ul>
                <LeaderBroadcastViz />
              </>
            )}
            {turbineTab === 'splitting' && (
              <>
                <p>
                  A more efficient use of the network's bandwidth would be to split this block up
                  into smaller pieces (shreds) and disseminate different shreds to different nodes,
                  who then collaborate to reconstruct the entire block.
                </p>
                <BlockSplitViz />
                <p>
                  However, malicious nodes now have the ability to withold their shred and prevent
                  reconstruction of the block.
                </p>
              </>
            )}
            {turbineTab === 'erasure' && (
              <>
                <ul className="turbine-bullets">
                  <li>
                    Instead of naively shredding the block and distributing shreds, the leader
                    could erasure code their block into shreds with redundancy.
                  </li>
                  <li>
                    A protocol can tune the redundancy to the desired level so that there is a
                    high level of confidence the block can always be reconstructed despite network
                    failures or malicious nodes.
                  </li>
                </ul>
                <ErasureCodeViz />
              </>
            )}
            {turbineTab === 'turbine' && (
              <>
                <ul className="turbine-bullets">
                  <li>
                    Solana splits blocks into shreds, which are grouped into Forward
                    Error Correction (FEC) sets.
                    <ul className="turbine-subbullets">
                      <li>
                        FEC sets are commonly 32 data shreds + 32 Reed-Solomon coded shreds for
                        redundancy, so up to 32 shreds from the set can be lost and the entire
                        set can still be recovered.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Each shred gets its own "Turbine Tree", a tree-shaped hierarchy of validators
                    that the shred disseminates through.
                    <ul className="turbine-subbullets">
                      <li>
                        Every validator can independently compute the Turbine Tree for a shred
                        using a deterministic seed of: leader id, slot, shred index, and shred
                        type.
                      </li>
                      <li>
                        The tree-construction algorithm favors more heavily stake-weighted
                        validators closer to the root, with some shuffling so it isn't purely
                        stake-based.
                      </li>
                    </ul>
                  </li>
                  <li>
                    The leader sends the shred to the root node; the root computes the same tree
                    and fans the shred out to ~200 validators in the next layer; each of those
                    fans out to ~200 more, and so on.
                  </li>
                </ul>
                <TurbineTreeViz />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ErasureCoding;
