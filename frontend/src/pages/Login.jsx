import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import Logo from '../components/Logo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const handleSubmit = async () => {
    if (!form.email || !form.password) return showToast('Please fill all fields', 'error');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {toast && <Toast {...toast} onClose={hideToast} />}
      <div style={{
        background: 'white', borderRadius: 20, padding: '36px 28px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={40} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>Welcome back</h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>Sign in to your workspace</p>

        {[
          { placeholder: 'Email address', key: 'email', type: 'email' },
          { placeholder: 'Password', key: 'password', type: 'password' },
        ].map(f => (
          <input
            key={f.key}
            type={f.type}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              display: 'block', width: '100%', padding: '13px 16px',
              borderRadius: 10, border: '1.5px solid #e5e7eb',
              fontSize: 15, outline: 'none', marginBottom: 12
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        ))}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white', fontSize: 16, fontWeight: 700, marginTop: 4
        }}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 14 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#667eea', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}