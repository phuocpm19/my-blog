'use client';

import { useState } from 'react';

const MULTIPLIER: Record<string, Record<string, number>> = {
  BTCUSD: { Exness: 1, FTMO: 1 },
  ETHUSD: { Exness: 1, FTMO: 10 },
  XAUUSD: { Exness: 100, FTMO: 100 },
};
const PAIR_LABELS: Record<string, string> = {
  BTCUSD: 'BTC/USD',
  ETHUSD: 'ETH/USD',
  XAUUSD: 'XAU/USD',
};
const PRICE_DECIMALS: Record<string, number> = {
  BTCUSD: 2,
  ETHUSD: 2,
  XAUUSD: 3,
};

function fmt(n: number, d = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtVol(n: number) {
  return parseFloat(n.toFixed(5)).toString();
}

const inputBase: React.CSSProperties = {
  background: '#1e2130',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#2d3148',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: "'SF Mono','Fira Code',monospace",
  transition: 'border-color 0.15s',
};

const selectBase: React.CSSProperties = {
  ...inputBase,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
};

function Field({ label, children, error }: { label: React.ReactNode; children: React.ReactNode; error?: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 1 }}>{error}</span>}
    </div>
  );
}

function NInput({
  value, onChange, step = 0.01, placeholder = '', error, suffix,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  placeholder?: string;
  error?: string | null;
  suffix?: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="number"
        value={value ?? ''}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        style={{ ...inputBase, ...(error ? { borderColor: '#ef4444' } : {}), ...(suffix ? { paddingRight: 32 } : {}) }}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = '#4f6ef7'; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = error ? '#ef4444' : '#2d3148'; }}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 13 }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function PosBtns({ value, onChange }: { value: 'buy' | 'sell'; onChange: (v: 'buy' | 'sell') => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d3148' }}>
      {(['buy', 'sell'] as const).map((p, i) => (
        <button key={p} onClick={() => onChange(p)} style={{
          padding: '11px 0', border: 'none',
          borderLeft: i === 1 ? '1px solid #2d3148' : 'none',
          cursor: 'pointer', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em',
          transition: 'all 0.2s',
          background: value === p
            ? p === 'buy' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#b91c1c)'
            : '#1e2130',
          color: value === p ? '#fff' : '#4b5563',
        }}>
          {p === 'buy' ? '▲ Buy / Long' : '▼ Sell / Short'}
        </button>
      ))}
    </div>
  );
}

function PnlBox({ label, pips, dollar, pct, type }: {
  label: string; pips?: number; dollar?: number; pct?: number; type: 'sl' | 'tp';
}) {
  const isSl = type === 'sl';
  const accent = isSl ? '#ef4444' : '#22c55e';
  const empty = pips === undefined;
  const sign = isSl ? '−' : '+';

  return (
    <div style={{
      flex: 1,
      background: isSl ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)',
      border: `1px solid ${isSl ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
      borderRadius: 10, padding: '12px 14px',
    }}>
      {/* Label */}
      <div style={{
        fontSize: 10, color: empty ? '#374151' : accent,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        fontWeight: 700, marginBottom: 8,
      }}>
        {label}
      </div>

      {empty ? (
        <div style={{ color: '#374151', fontSize: 22, fontWeight: 700 }}>—</div>
      ) : (
        <>
          {/* Row 1: price change (left) + % (right) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{
              color: accent, fontSize: 12,
              fontFamily: "'SF Mono',monospace", opacity: 0.85,
            }}>
              {fmt(pips!, 2)}
            </span>
            <span style={{
              color: accent, fontSize: 12,
              fontFamily: "'SF Mono',monospace", opacity: 0.85,
            }}>
              {sign}{fmt(pct!, 2)}%
            </span>
          </div>

          {/* Row 2: dollar amount — bigger, centered */}
          <div style={{
            color: accent, fontSize: 18, fontWeight: 800,
            fontFamily: "'SF Mono',monospace",
            textAlign: 'center',
            background: isSl ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            borderRadius: 6, padding: '6px 0',
          }}>
            {sign}{fmt(dollar!, 2)}$
          </div>
        </>
      )}
    </div>
  );
}

function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(79,110,247,0.08),rgba(79,110,247,0.03))',
      border: '1px solid rgba(79,110,247,0.18)',
      borderRadius: 12, padding: 18,
    }}>
      {children}
    </div>
  );
}

const g2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

// ─── Tab 1 ────────────────────────────────────────────────────────────────────
function PriceToVolTab() {
  const [platform, setPlatform] = useState('Exness');
  const [pair, setPair] = useState('BTCUSD');
  const [capital, setCapital] = useState<number | null>(10000);
  const [position, setPosition] = useState<'buy' | 'sell'>('buy');
  const [entry, setEntry] = useState<number | null>(null);
  const [sl, setSl] = useState<number | null>(null);
  const [tp, setTp] = useState<number | null>(null);
  const [risk, setRisk] = useState<number | null>(1);

  const dec = PRICE_DECIMALS[pair] ?? 2;
  const pxStep = pair === 'XAUUSD' ? 0.001 : 0.01;

  const slError = sl !== null && entry !== null
    ? (position === 'sell' && sl < entry ? 'SL phải ≥ entry (Sell)'
      : position === 'buy' && sl > entry ? 'SL phải ≤ entry (Buy)' : null) : null;
  const tpError = tp !== null && entry !== null
    ? (position === 'sell' && tp > entry ? 'TP phải ≤ entry (Sell)'
      : position === 'buy' && tp < entry ? 'TP phải ≥ entry (Buy)' : null) : null;

  const m = MULTIPLIER[pair]?.[platform];
  let vol: number | null = null;
  let slPips: number | undefined, slDollar: number | undefined, slPct: number | undefined;
  let tpPips: number | undefined, tpDollar: number | undefined, tpPct: number | undefined;
  let rr: number | undefined;

  if (!slError && m && entry !== null && sl !== null && capital && risk) {
    const slP = Math.abs(entry - sl);
    if (slP > 0) {
      vol = (capital * risk / 100) / (slP * m);
      slPips = slP; slDollar = vol * slP * m; slPct = slDollar * 100 / capital;
      if (!tpError && tp !== null) {
        const tpP = Math.abs(entry - tp);
        tpPips = tpP; tpDollar = vol * tpP * m; tpPct = tpDollar * 100 / capital;
        rr = tpP / slP;
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={g2}>
        <Field label="Nền tảng">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={selectBase}>
            <option value="Exness">Exness</option>
            <option value="FTMO">FTMO</option>
          </select>
        </Field>
        <Field label="Cặp giao dịch">
          <select value={pair} onChange={(e) => { setPair(e.target.value); setEntry(null); setSl(null); setTp(null); }} style={selectBase}>
            {Object.entries(PAIR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Vị thế"><PosBtns value={position} onChange={setPosition} /></Field>

      <div style={g2}>
        <Field label="Vốn ($)">
          <NInput value={capital} onChange={setCapital} step={100} placeholder="10000" />
        </Field>
        <Field label="Risk (%)">
          <NInput value={risk} onChange={setRisk} step={0.1} placeholder="1" suffix="%" />
        </Field>
      </div>

      <Field label="Entry">
        <NInput value={entry} onChange={setEntry} step={pxStep} placeholder="Giá vào lệnh" />
      </Field>

      <div style={g2}>
        <Field label="Stop Loss" error={slError}>
          <NInput value={sl} onChange={setSl} step={pxStep} placeholder="Giá SL" error={slError} />
        </Field>
        <Field label={<>Take Profit <span style={{ color: '#4b5563', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>(tuỳ chọn)</span></>} error={tpError}>
          <NInput value={tp} onChange={setTp} step={pxStep} placeholder="Không bắt buộc" error={tpError} />
        </Field>
      </div>

      <ResultCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Khối lượng giao dịch</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 800, color: vol !== null ? '#4f6ef7' : '#2d3148', fontFamily: "'SF Mono',monospace", lineHeight: 1 }}>
                {vol !== null ? fmtVol(vol) : '—'}
              </span>
              <span style={{ color: '#4b5563', fontSize: 14 }}>lot</span>
            </div>
          </div>
          {rr !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>R:R</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#4f6ef7', fontFamily: "'SF Mono',monospace" }}>1:{fmt(rr, 2)}</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PnlBox label="Stop Loss" pips={slPips} dollar={slDollar} pct={slPct} type="sl" />
          <PnlBox label="Take Profit" pips={tpPips} dollar={tpDollar} pct={tpPct} type="tp" />
        </div>
      </ResultCard>
    </div>
  );
}

// ─── Tab 2 ────────────────────────────────────────────────────────────────────
function VolToSlTpTab() {
  const [platform, setPlatform] = useState('Exness');
  const [pair, setPair] = useState('BTCUSD');
  const [capital, setCapital] = useState<number | null>(10000);
  const [position, setPosition] = useState<'buy' | 'sell'>('sell');
  const [entry, setEntry] = useState<number | null>(null);
  const [risk, setRisk] = useState<number | null>(2);
  const [vol, setVol] = useState<number | null>(null);
  const [rr, setRr] = useState<number | null>(2);

  const dec = PRICE_DECIMALS[pair] ?? 2;
  const pxStep = pair === 'XAUUSD' ? 0.001 : 0.01;
  const m = MULTIPLIER[pair]?.[platform];

  let slPrice: number | undefined, tpPrice: number | undefined;
  let slPips: number | undefined, slDollar: number | undefined, slPct: number | undefined;
  let tpPips: number | undefined, tpDollar: number | undefined, tpPct: number | undefined;

  if (m && entry !== null && vol !== null && vol > 0 && capital && risk && rr && rr > 0) {
    const slDist = (capital * risk / 100) / (vol * m);
    const tpDist = slDist * rr;
    slPrice = position === 'sell' ? entry + slDist : entry - slDist;
    tpPrice = position === 'sell' ? entry - tpDist : entry + tpDist;
    slPips = slDist; slDollar = vol * slDist * m; slPct = slDollar * 100 / capital;
    tpPips = tpDist; tpDollar = vol * tpDist * m; tpPct = tpDollar * 100 / capital;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={g2}>
        <Field label="Nền tảng">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={selectBase}>
            <option value="Exness">Exness</option>
            <option value="FTMO">FTMO</option>
          </select>
        </Field>
        <Field label="Cặp giao dịch">
          <select value={pair} onChange={(e) => { setPair(e.target.value); setEntry(null); }} style={selectBase}>
            {Object.entries(PAIR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Vị thế"><PosBtns value={position} onChange={setPosition} /></Field>

      <div style={g2}>
        <Field label="Vốn ($)">
          <NInput value={capital} onChange={setCapital} step={100} placeholder="10000" />
        </Field>
        <Field label="Risk (%)">
          <NInput value={risk} onChange={setRisk} step={0.1} placeholder="2" suffix="%" />
        </Field>
      </div>

      <Field label="Entry">
        <NInput value={entry} onChange={setEntry} step={pxStep} placeholder="Giá vào lệnh" />
      </Field>

      <div style={g2}>
        <Field label="Volume (lot)">
          <NInput value={vol} onChange={setVol} step={0.01} placeholder="0.1" />
        </Field>
        <Field label="Risk:Reward (RR)">
          <NInput value={rr} onChange={setRr} step={0.1} placeholder="2" />
        </Field>
      </div>

      <ResultCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {([
            { label: 'Stop Loss', val: slPrice, accent: '#ef4444', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)' },
            { label: 'Take Profit', val: tpPrice, accent: '#22c55e', bg: 'rgba(34,197,94,0.07)', border: 'rgba(34,197,94,0.2)' },
          ] as const).map(({ label, val, accent, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: val !== undefined ? accent : '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: val !== undefined ? accent : '#2d3148', fontFamily: "'SF Mono',monospace" }}>
                {val !== undefined ? val.toFixed(dec) : '—'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PnlBox label="Stop Loss" pips={slPips} dollar={slDollar} pct={slPct} type="sl" />
          <PnlBox label="Take Profit" pips={tpPips} dollar={tpDollar} pct={tpPct} type="tp" />
        </div>
      </ResultCard>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function ToolsClient() {
  const [tab, setTab] = useState<'price-to-vol' | 'vol-to-sl'>('price-to-vol');

  return (
    <>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        select option { background: #1e2130; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px 80px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg,#4f6ef7,#3b55e0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, boxShadow: '0 4px 16px rgba(79,110,247,0.3)',
              }}>⚡</div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                Công cụ giao dịch
              </h1>
            </div>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 14, paddingLeft: 52 }}>
              Tính toán khối lượng, SL/TP dựa trên quản lý vốn
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: '#111827', borderRadius: 12, padding: 4, marginBottom: 4 }}>
            {([
              { key: 'price-to-vol', icon: '💰', label: 'Giá → Lot' },
              { key: 'vol-to-sl', icon: '📍', label: 'Lot → SL/TP' },
            ] as const).map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '11px 0', border: 'none', cursor: 'pointer', borderRadius: 9,
                fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                background: tab === key ? 'linear-gradient(135deg,#4f6ef7,#3b55e0)' : 'transparent',
                color: tab === key ? '#fff' : '#6b7280',
                boxShadow: tab === key ? '0 2px 12px rgba(79,110,247,0.35)' : 'none',
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: '#111827', borderRadius: 16, padding: 24, border: '1px solid #1f2937', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            {tab === 'price-to-vol' ? <PriceToVolTab /> : <VolToSlTpTab />}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#9ca3af', fontSize: 11 }}>
            Dữ liệu chỉ mang tính tham khảo · Không phải lời khuyên đầu tư
          </p>
        </div>
      </div>
    </>
  );
}
