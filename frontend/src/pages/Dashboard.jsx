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
        let totalTasks = 0, overdue = 0, done = 0;
        for (const p of projects.data) {
          const tasks = await api.get(`/tasks/${p._id}`);
          totalTasks += tasks.data.length;
          done += tasks.data.filter(t => t.status === 'Done').length;
          overdue += tasks.data.filter(t =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
          ).length;
        }
        setStats({ projects: projects.data.length, tasks: totalTasks, done, overdue });
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Projects',     value: stats.projects, icon: '📁', color: '#667eea', bg: '#eef2ff' },
    { label: 'Total Tasks',  value: stats.tasks,    icon: '📋', color: '#0891b2', bg: '#e0f7fa' },
    { label: 'Completed',    value: stats.done,     icon: '✅', color: '#059669', bg: '#d1fae5' },
    { label: 'Overdue',      value: stats.overdue,  icon: '⚠️', color: '#dc2626', bg: '#fee2e2' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f7' }}>

      {/* Navbar */}
      <div style={{
        background: 'white', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={36} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 20,
            background: user.role === 'Admin' ? '#fef3c7' : '#dbeafe',
            color: user.role === 'Admin' ? '#92400e' : '#1e40af',
            fontSize: 13, fontWeight: 600
          }}>
            {user.role === 'Admin' ? '👑' : '👤'} {user.role}
          </span>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb',
              background: 'white', color: '#374151', fontWeight: 600, fontSize: 13
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} 
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 36 }}>Here's what's happening in your workspace today.</p>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: 'white', borderRadius: 16, padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderTop: `4px solid ${c.color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                <span style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: c.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20
                }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: c.color }}>
                {loading ? '...' : c.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => navigate('/projects')}
              style={{
                padding: '14px 28px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', fontWeight: 700, fontSize: 15
              }}
            >
              📁 View Projects
            </button>
            {user.role === 'Admin' && (
              <button
                onClick={() => navigate('/projects')}
                style={{
                  padding: '14px 28px', borderRadius: 12,
                  border: '1.5px solid #667eea', background: 'white',
                  color: '#667eea', fontWeight: 700, fontSize: 15
                }}
              >
                ➕ New Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}