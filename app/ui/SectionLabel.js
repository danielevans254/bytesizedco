export default function SectionLabel({ index, children, accent = false, className = "" }) {
  const text = index ? `${index} / ${children}` : children;
  return (
    <div className={`label ${className}`.trim()}>
      <span className={`kicker${accent ? "" : " dim"}`}>{text}</span>
    </div>
  );
}
