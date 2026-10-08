export function BrandMark({ className = "logo-mark" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <path d="M9 8 H7 V24 H9" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="square" />
      <path d="M23 8 H25 V24 H23" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="square" />
      <rect x="13" y="13" width="6" height="6" rx="1" fill="var(--accent-ink)" />
    </svg>
  );
}

export default function Brand({ href = "/", className = "brand", label = "Byte Sized Co." }) {
  return (
    <a className={className} href={href}>
      <BrandMark />
      <span>{label}</span>
    </a>
  );
}
