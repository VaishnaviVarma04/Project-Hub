import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46', icon: '✅' },
    error:   { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b', icon: '❌' },
    info:    { bg: '#dbeafe', border: '#93c5fd', color: '#1e40af', icon: 'ℹ️' },
  };
  const c = colors[type];

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: c.bg, border: `1.5px solid ${c.border}`, color: c.color,
      borderRadius: 12, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      animation: 'slideIn 0.3s ease',
      minWidth: 280, maxWidth: 380, fontWeight: 500
    }}>
      <span style={{ fontSize: 20 }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', fontSize: 18,
        color: c.color, opacity: 0.6, cursor: 'pointer', lineHeight: 1
      }}>×</button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}