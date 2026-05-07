import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, done: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projects = await api.get('/projects');
        let tasks = 0, done = 0, overdue = 0;
        for (const p of projects.data) {
          const t = await api.get(`/tasks/${p._id}`);
          tasks += t.data.length;
          done += t.data.filter(t => t.status === 'Done').length;
          overdue += t.data.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;
        }
        setStats({ projects: projects.data.length, tasks, done, overdue });
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Projects',    value: stats.projects, icon: '📁', color: '#667eea', bg: '#eef2ff' },
    { label: 'Total Tasks', value: stats.tasks,    icon: '📋', color: '#0891b2', bg: '#e0f7fa' },
    { label: 'Completed',   value: stats.done,     icon: '✅', color: '#059669', bg: '#d1fae5' },
    { label: 'Overdue',     value: stats.overdue,  icon: '⚠️', color: '#dc2626', bg: '#fee2e2' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f7' }}>
      {/* Navbar */}
      <div style={{
        background: 'white', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Logo size={30} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: user.role === 'Admin' ? '#fef3c7' : '#dbeafe',
            color: user.role === 'Admin' ? '#92400e' : '#1e40af'
          }}>
            {user.role === 'Admin' ? '👑' : '👤'} {user.role}
          </span>
          <button onClick={logout} style={{
            padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
            background: 'white', color: '#374151', fontWeight: 600, fontSize: 12
          }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>
          {greeting}, {user.name.split(' ')[0]} 
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 13 }}>Here's your workspace overview.</p>

        {/* Stat Cards — 2 columns on mobile, 4 on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12, marginBottom: 24
        }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: 'white', borderRadius: 14, padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderTop: `3px solid ${c.color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>{c.label}</span>
                <span style={{
                  width: 34, height: 34, borderRadius: 8, background: c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>
                {loading ? '...' : c.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => navigate('/projects')} style={{
              padding: '13px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', fontWeight: 700, fontSize: 14, textAlign: 'center'
            }}>📁 View All Projects</button>
            {user.role === 'Admin' && (
              <button onClick={() => navigate('/projects')} style={{
                padding: '13px', borderRadius: 10,
                border: '1.5px solid #667eea', background: 'white',
                color: '#667eea', fontWeight: 700, fontSize: 14
              }}>➕ Create New Project</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}