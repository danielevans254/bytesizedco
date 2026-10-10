// Procedural, on-brand product art (no photos). Swap for real imagery later.
// `companion` renders the shared "digital file" motif instead of the physical one.

const SH = "var(--accent)";
const LN = "var(--line-hi)";
const SUR = "var(--surface-2)";

function Frame({ children }) {
  return (
    <svg viewBox="0 0 600 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }}>
      <rect width="600" height="440" fill="var(--surface)" />
      <rect x="0.5" y="0.5" width="599" height="439" stroke="var(--line)" />
      {children}
    </svg>
  );
}

function Physical({ variant, color }) {
  const F = color || SUR;
  switch (variant) {
    case "carry":
      return (
        <>
          <rect x="120" y="150" width="360" height="160" rx="14" stroke={SH} strokeWidth="2" />
          <line x1="240" y1="150" x2="240" y2="310" stroke={LN} strokeWidth="2" />
          <line x1="360" y1="150" x2="360" y2="310" stroke={LN} strokeWidth="2" />
          <rect x="150" y="185" width="60" height="40" rx="6" fill={F} opacity={color ? 0.85 : 0.18} />
          <circle cx="300" cy="232" r="22" stroke={LN} strokeWidth="2" />
          <rect x="392" y="190" width="56" height="80" rx="6" stroke={LN} strokeWidth="2" />
        </>
      );
    case "wear":
      return (
        <>
          <path d="M195 135 l55 28 50-18 50 18 55-28 32 66-52 18 v122 H215 V237 l-52-18z" stroke={SH} strokeWidth="2" fill={F} />
          <line x1="300" y1="165" x2="300" y2="358" stroke={LN} strokeWidth="2" strokeDasharray="4 7" />
          <rect x="280" y="330" width="40" height="14" rx="3" stroke={SH} strokeWidth="1.5" opacity="0.7" />
        </>
      );
    case "play":
      return (
        <>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const on = r === 1 && c === 1;
              return (
                <rect key={`${r}-${c}`} x={190 + c * 78} y={110 + r * 78} width="62" height="62" rx="8"
                  stroke={on ? SH : LN} strokeWidth="2" fill={on ? SH : "none"} opacity={on ? 0.2 : 1} />
              );
            })
          )}
        </>
      );
    case "read":
      return (
        <>
          <rect x="170" y="120" width="260" height="200" rx="8" stroke={SH} strokeWidth="2" fill={SUR} />
          <line x1="300" y1="120" x2="300" y2="320" stroke={LN} strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="195" y1={160 + i * 30} x2={i === 0 ? 285 : 280} y2={160 + i * 30} stroke={i === 0 ? SH : LN} strokeWidth="3" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={`r${i}`} x1="315" y1={160 + i * 30} x2={i === 1 ? 410 : 405} y2={160 + i * 30} stroke={LN} strokeWidth="3" />
          ))}
        </>
      );
    case "sound":
      return (
        <>
          {[80, 150, 60, 190, 110, 220, 95, 160].map((h, i) => (
            <rect key={i} x={170 + i * 34} y={250 - h / 2} width="16" height={h} rx="4" fill={i % 3 === 0 ? SH : LN} opacity={i % 3 === 0 ? 0.9 : 0.5} />
          ))}
          <line x1="160" y1="250" x2="455" y2="250" stroke={LN} strokeWidth="2" />
        </>
      );
    case "out":
      return (
        <>
          <circle cx="410" cy="150" r="26" fill={SH} opacity="0.2" />
          <path d="M120 320 L240 165 L320 250 L380 200 L480 320 Z" stroke={SH} strokeWidth="2" fill={F} />
          <path d="M240 165 L290 222 L260 250 L320 250" stroke={LN} strokeWidth="2" />
        </>
      );
    case "move":
      return (
        <>
          <circle cx="300" cy="220" r="92" stroke={LN} strokeWidth="2" />
          <circle cx="300" cy="220" r="62" stroke={SH} strokeWidth="2" opacity="0.7" fill={color || "none"} fillOpacity={color ? 0.16 : 0} />
          <path d="M150 220 h66 l18-46 30 96 24-66 18 32 h84" stroke={SH} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

function Companion() {
  const C = "var(--accent)";
  return (
    <>
      <rect x="140" y="118" width="320" height="204" rx="12" stroke={C} strokeWidth="2" fill={SUR} />
      <line x1="140" y1="154" x2="460" y2="154" stroke={LN} strokeWidth="2" />
      <circle cx="162" cy="136" r="4" fill={C} />
      <circle cx="180" cy="136" r="4" fill={LN} />
      <circle cx="198" cy="136" r="4" fill={LN} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1="166" y1={186 + i * 26} x2={i === 0 ? 360 : 320} y2={186 + i * 26} stroke={i === 0 ? C : LN} strokeWidth="4" strokeLinecap="round" />
      ))}
      <circle cx="395" cy="270" r="26" stroke={C} strokeWidth="2" />
      <path d="M395 258 v24 M386 273 l9 9 9-9" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export default function ProductArt({ variant = "carry", companion = false, color }) {
  return <Frame>{companion ? <Companion /> : <Physical variant={variant} color={color} />}</Frame>;
}
