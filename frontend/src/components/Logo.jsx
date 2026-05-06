export default function Logo({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea"/>
            <stop offset="100%" stopColor="#764ba2"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#logoGrad)"/>
        <rect x="14" y="14" width="7" height="36" rx="2" fill="white"/>
        <rect x="14" y="14" width="28" height="7" rx="2" fill="white"/>
        <rect x="14" y="28" width="23" height="7" rx="2" fill="white"/>
        <rect x="35" y="14" width="7" height="21" rx="2" fill="white"/>
        <circle cx="50" cy="50" r="5" fill="#fbbf24"/>
      </svg>
      <span style={{
        fontWeight: 800, fontSize: size * 0.56,
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        Project<span style={{ fontWeight: 400, WebkitTextFillColor: '#1a1d23', color: '#1a1d23' }}>Hub</span>
      </span>
    </div>
  );
}