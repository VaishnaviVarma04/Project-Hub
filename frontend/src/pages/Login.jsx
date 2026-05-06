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
      justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {toast && <Toast {...toast} onClose={hideToast} />}

      <div style={{
        background: 'white', borderRadius: 20, padding: '48px 40px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <Logo size={44} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1d23' }}>Welcome back</h1>
            <p style={{ color: '#6b7280', marginTop: 6 }}>Sign in to your workspace</p>
        </div>

        {[
          { placeholder: 'Email address', key: 'email', type: 'email' },
          { placeholder: 'Password', key: 'password', type: 'password' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', fontSize: 16, fontWeight: 700, marginTop: 8
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 14 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#667eea', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}