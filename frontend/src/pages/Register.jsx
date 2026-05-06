import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return showToast('Please fill all fields', 'error');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Registration failed', 'error');
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
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Create account</h1>
            <p style={{ color: '#6b7280', marginTop: 6 }}>Join your team's workspace</p>
        </div>

        {[
          { placeholder: 'Full name', key: 'name', type: 'text' },
          { placeholder: 'Email address', key: 'email', type: 'email' },
          { placeholder: 'Password', key: 'password', type: 'password' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'block' }}>Role</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Member', 'Admin'].map(r => (
              <button
                key={r}
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  border: `2px solid ${form.role === r ? '#667eea' : '#e5e7eb'}`,
                  background: form.role === r ? '#eef2ff' : 'white',
                  color: form.role === r ? '#4338ca' : '#6b7280',
                  fontWeight: 600, fontSize: 14
                }}
              >
                {r === 'Admin' ? '👑 Admin' : '👤 Member'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', fontSize: 16, fontWeight: 700
          }}
        >
          {loading ? 'Creating...' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#667eea', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}