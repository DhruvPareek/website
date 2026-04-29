import { useState, useEffect, useRef } from 'react';
import '../Styling/ErasureCoding.css';
import '../Styling/Essay.css';
import '../Styling/ProofOfHistory.css';

// ── Parallel verification visualization ───────────────────

const V_CHUNK_HASHES = 5;
const V_VERIFS_PER_CHUNK = V_CHUNK_HASHES - 1;
const V_NUM_CORES = 3;
const V_STEP_MS = 650;
const V_PAUSE_MS = 1700;

function PoHVerifyViz() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (running) {
      if (progress < V_VERIFS_PER_CHUNK) {
        timer = setTimeout(() => setProgress(p => p + 1), V_STEP_MS);
      } else {
        timer = setTimeout(() => setRunning(false), V_STEP_MS);
      }
    } else {
      timer = setTimeout(() => {
        setProgress(0);
        setRunning(true);
      }, V_PAUSE_MS);
    }
    return () => clearTimeout(timer);
  }, [progress, running]);

  const chunks = Array.from({ length: V_NUM_CORES }, (_, c) => {
    const start = c * V_VERIFS_PER_CHUNK + 1;
    return Array.from({ length: V_CHUNK_HASHES }, (_, i) => start + i);
  });

  const allVerified = progress >= V_VERIFS_PER_CHUNK;

  return (
    <div className="poh-verify-wrapper">
      <div className="poh-verify-header">
        <span className="poh-verify-title">parallel verification</span>
        <span
          className={
            'poh-verify-status ' + (allVerified ? 'poh-verify-status-done' : '')
          }
        >
          {allVerified ? '✓ chain verified' : 'verifying…'}
        </span>
      </div>
      <div className="poh-verify-cores">
        {chunks.map((chunk, idx) => (
          <div key={idx} className="poh-verify-core">
            <div className="poh-verify-core-label">core {idx + 1}</div>
            <div className="poh-verify-core-chain">
              {chunk.map((n, i) => (
                <span key={n} className="poh-verify-segment">
                  <span className="poh-verify-cell">
                    s<sub>{n}</sub>
                  </span>
                  {i < V_VERIFS_PER_CHUNK && (
                    <span
                      className={
                        'poh-verify-link ' +
                        (i < progress
                          ? 'verified'
                          : i === progress && running
                          ? 'active'
                          : 'pending')
                      }
                    >
                      {i < progress ? '✓' : '→'}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="poh-verify-caption">
        each core independently checks{' '}
        <code>
          H(s<sub>n</sub>) = s<sub>n+1</sub>
        </code>{' '}
        across its slice
      </div>
    </div>
  );
}

// ── PoH stream visualization ──────────────────────────────

const STEP_MS = 950;
const LINE_H = 16;
const STREAM_HEIGHT = 320;
const KEEP_BUFFER = 12;
const BATCH_MAX = 64;

type EntryKind = 'hash' | 'record' | 'tick';

type StreamEntry = {
  id: number;
  num: number;
  kind: EntryKind;
  eNum?: number;
  txs?: number[];
};

type FlyingTx = { id: number; num: number; lane: number };
type BatchTx = { id: number; num: number };

type StepPlan = { kind: EntryKind; spawn: number };

// Cycle: txs land in the batch over several steps, then a record() folds them in.
const PATTERN: StepPlan[] = [
  { kind: 'hash', spawn: 2 },    //  0  spawn 2 → land at idx 1
  { kind: 'hash', spawn: 2 },    //  1  spawn 2 → land at idx 2
  { kind: 'hash', spawn: 2 },    //  2  spawn 2 → land at idx 3
  { kind: 'record', spawn: 0 },  //  3  flush [tx1..tx6]
  { kind: 'hash', spawn: 3 },    //  4  spawn 3 → land at idx 5
  { kind: 'hash', spawn: 3 },    //  5  spawn 3 → land at idx 6
  { kind: 'hash', spawn: 2 },    //  6  spawn 2 → land at idx 7
  { kind: 'record', spawn: 0 },  //  7  flush [tx7..tx14]
  { kind: 'hash', spawn: 0 },    //  8
  { kind: 'hash', spawn: 0 },    //  9
  { kind: 'tick', spawn: 0 },    // 10
];
const PATTERN_LEN = PATTERN.length;

function entryHeight(e: StreamEntry): number {
  if (e.kind === 'record') return 6 * LINE_H;
  if (e.kind === 'tick') return 4 * LINE_H;
  return 3 * LINE_H;
}

function fmtTxList(txs: number[]): string {
  return txs.map(n => `tx${n}`).join(', ');
}

function fmtMixin(txs: number[]): string {
  if (txs.length === 1) return `tx${txs[0]}`;
  return `Merkle(${txs.map(n => `tx${n}`).join(', ')})`;
}

function PoHStreamViz() {
  const [entries, setEntries] = useState<StreamEntry[]>([]);
  const [flyingTxs, setFlyingTxs] = useState<FlyingTx[]>([]);
  const [batch, setBatch] = useState<BatchTx[]>([]);
  const [pulseId, setPulseId] = useState<number | null>(null);

  const flyingRef = useRef<FlyingTx[]>([]);
  const batchRef = useRef<BatchTx[]>([]);
  const idRef = useRef(0);
  const eNumRef = useRef(0);
  const txIdRef = useRef(0);
  const txNumRef = useRef(0);
  const stepRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      stepRef.current += 1;
      const step = stepRef.current;
      const plan = PATTERN[(step - 1) % PATTERN_LEN];

      // 1. Flying txs land in batch
      const landed: BatchTx[] = flyingRef.current.map(t => ({ id: t.id, num: t.num }));
      flyingRef.current = [];
      batchRef.current = [...batchRef.current, ...landed];

      // 2. Generate stream entry
      idRef.current += 1;
      let entry: StreamEntry;
      let didPulse = false;
      if (plan.kind === 'record') {
        eNumRef.current += 1;
        entry = {
          id: idRef.current,
          num: step,
          kind: 'record',
          eNum: eNumRef.current,
          txs: batchRef.current.map(b => b.num),
        };
        batchRef.current = [];
        didPulse = true;
      } else if (plan.kind === 'tick') {
        entry = { id: idRef.current, num: step, kind: 'tick' };
      } else {
        entry = { id: idRef.current, num: step, kind: 'hash' };
      }

      // 3. Spawn flying txs for next step
      if (plan.spawn > 0) {
        const newFlying: FlyingTx[] = [];
        const center = (plan.spawn - 1) / 2;
        for (let i = 0; i < plan.spawn; i++) {
          txIdRef.current += 1;
          txNumRef.current += 1;
          newFlying.push({ id: txIdRef.current, num: txNumRef.current, lane: i - center });
        }
        flyingRef.current = newFlying;
      }

      // 4. Sync render state
      setEntries(prev => {
        const all = [...prev, entry];
        return all.slice(-KEEP_BUFFER);
      });
      setFlyingTxs(flyingRef.current);
      setBatch(batchRef.current);
      if (didPulse) setPulseId(entry.id);
    }, STEP_MS);

    return () => clearInterval(interval);
  }, []);

  // Compute cumulative bottom positions (newest at bottom = 0)
  const sortedDesc = [...entries].sort((a, b) => b.num - a.num);
  let cum = 0;
  const positioned = sortedDesc.map(e => {
    const h = entryHeight(e);
    const item = { e, bottom: cum, height: h };
    cum += h;
    return item;
  });

  return (
    <div className="poh-viz-wrapper">
      <div className="poh-viz-row">
        <div className="poh-intake-track">
          <div className="poh-intake-spacer-top" />
          <div className="poh-intake-wire">
            <div className="poh-intake-label">incoming txs</div>
            <div className="poh-intake-line" />
            <div className="poh-intake-arrow">▶</div>
            {flyingTxs.map(t => (
              <div
                key={t.id}
                className="poh-tx-pill"
                style={{ top: `calc(50% - 11px + ${t.lane * 22}px)` }}
              >
                tx{t.num}
              </div>
            ))}
          </div>
          <div className="poh-intake-spacer-bot" />
        </div>

        <div className="poh-validator-col">
          <div className="poh-validator-label">Validator</div>
          <div className="poh-validator-box">
            <div className="poh-batch">
              <div className="poh-batch-header">
                <span className="poh-batch-name">batch</span>
                <span className="poh-batch-count">
                  {batch.length} / {BATCH_MAX}
                </span>
              </div>
              <div className="poh-batch-slots">
                {batch.length === 0 ? (
                  <span className="poh-batch-empty">— empty —</span>
                ) : (
                  batch.map(tx => (
                    <div key={tx.id} className="poh-batch-tx">tx{tx.num}</div>
                  ))
                )}
              </div>
            </div>

            <div className="poh-batch-flow">
              <span className="poh-batch-flow-line" />
              <span className="poh-batch-flow-label">record(Merkle(batch))</span>
              <span className="poh-batch-flow-line" />
            </div>

            <div className="poh-stream-area" style={{ height: STREAM_HEIGHT }}>
              {positioned.map(({ e, bottom, height }) => {
                const top = STREAM_HEIGHT - bottom - height;
                let opacity = 1;
                if (top < -height) opacity = 0;
                else if (top < 28) opacity = Math.max(0, (top + height) / (height + 28));
                const classes = [
                  'poh-entry',
                  `poh-entry-${e.kind}`,
                  e.id === pulseId ? 'poh-entry-pulse' : '',
                ].filter(Boolean).join(' ');
                const prevName = e.num === 1 ? 'seed' : `s${e.num - 1}`;
                return (
                  <div
                    key={e.id}
                    className={classes}
                    style={{ bottom, height, opacity }}
                  >
                    <div className="poh-line poh-line-hash">
                      s{e.num} = H({prevName})
                    </div>
                    <div className="poh-line poh-line-conn">│</div>
                    {e.kind === 'record' && e.txs && e.eNum !== undefined && (
                      <>
                        <div className="poh-line poh-line-branch">
                          ├── record {fmtTxList(e.txs)} here
                        </div>
                        <div className="poh-line poh-line-formula">
                          {`│      `}e{e.eNum} = H(s{e.num} || {fmtMixin(e.txs)})
                        </div>
                        <div className="poh-line poh-line-conn">│</div>
                      </>
                    )}
                    {e.kind === 'tick' && (
                      <div className="poh-line poh-line-branch">
                        ├── tick · checkpoint
                      </div>
                    )}
                    <div className="poh-line poh-line-arrow">▼</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="poh-legend" aria-label="PoH parameters">
          <div className="poh-legend-title">Solana defaults</div>
          <dl className="poh-legend-list">
            <div className="poh-legend-row">
              <dt>block</dt>
              <dd>~400 ms</dd>
            </div>
            <div className="poh-legend-row">
              <dt>hashes / block</dt>
              <dd>800,000</dd>
            </div>
            <div className="poh-legend-row">
              <dt>hashes / tick</dt>
              <dd>12,500</dd>
            </div>
            <div className="poh-legend-row">
              <dt>ticks / slot</dt>
              <dd>64</dd>
            </div>
            <div className="poh-legend-row">
              <dt>batch</dt>
              <dd>≤ 64 txs</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="poh-primitives">
        <div className="poh-primitives-title">PoH primitives</div>
        <dl className="poh-primitives-list">
          <div className="poh-primitive">
            <dt><code>hash(n)</code></dt>
            <dd>runs <code>n</code> plain SHA-256 iterations on the running hash.</dd>
          </div>
          <div className="poh-primitive">
            <dt><code>record(mixin)</code></dt>
            <dd>
              instead of a plain hash, computes <code>hashv(current_hash, mixin)</code> to
              fold transaction data into the chain.
            </dd>
          </div>
          <div className="poh-primitive">
            <dt><code>tick()</code></dt>
            <dd>
              the final hash that closes a tick once <code>hashes_per_tick</code> is
              reached; emits a <code>PohEntry</code>.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ProofOfHistory() {
  return (
    <div className="essay-container">
      <p className="essay-title">Proof of History</p>
      <div className="turbine-content">
        <ul className="turbine-bullets">
          <li>
            Proof of History is not Solana's consensus mechanism, rather it is a
            component which supports sequencing transactions that eventually helps
            streamline consensus
            <ul className="turbine-subbullets">
              <li>
                PoH is like a decentralized clock for the network
                that proves the timing and ordering of events
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <PoHStreamViz />
      <div className="turbine-content">
        <ul className="turbine-bullets">
          <li>
            PoH is a continuous chain of SHA-256 hashes
            <ul className="turbine-subbullets">
              <li>
                Occasionally the Merkle root of a batch of txs gets mixed into the
                hash chain
              </li>
            </ul>
          </li>
          <li>
            The PoH chain acts similarly to a verifiable delay function in that it
            takes a long amount of time to compute but can be verified easily
            <ul className="turbine-subbullets">
              <li>
                The PoH chain must be computed sequentially but can be verified in
                parallel
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <PoHVerifyViz />
    </div>
  );
}

export default ProofOfHistory;
