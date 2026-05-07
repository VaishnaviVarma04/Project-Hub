import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import Logo from '../components/Logo';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMemberTo, setAddingMemberTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const fetchProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.data);
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async () => {
    if (!name.trim()) return showToast('Enter a project name', 'error');
    setLoading(true);
    try {
      await api.post('/projects', { name });
      setName(''); fetchProjects(); showToast('Project created!');
    } catch { showToast('Failed to create project', 'error'); }
    finally { setLoading(false); }
  };

  const deleteProject = async (id) => {
    try { await api.delete(`/projects/${id}`); fetchProjects(); showToast('Project deleted', 'info'); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const addMember = async (projectId) => {
    if (!memberEmail.trim()) return showToast('Enter member email', 'error');
    try {
      await api.put(`/projects/${projectId}/members`, { email: memberEmail });
      showToast('Member added!'); setMemberEmail(''); setAddingMemberTo(null); fetchProjects();
    } catch (err) { showToast(err.response?.data?.msg || 'Failed to add member', 'error'); }
  };

  const removeMember = async (projectId, userId) => {
    try {
      await api.delete(`/projects/${projectId}/members`, { data: { userId } });
      showToast('Member removed', 'info'); fetchProjects();
    } catch (err) { showToast(err.response?.data?.msg || 'Failed to remove member', 'error'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f7' }}>
      {toast && <Toast {...toast} onClose={hideToast} />}

      {/* Navbar */}
      <div style={{
        background: 'white', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <button onClick={() => navigate('/')} style={{
          padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
          background: 'white', fontWeight: 600, fontSize: 12, color: '#374151', flexShrink: 0
        }}>← Back</button>
        <Logo size={28} />
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Projects</h2>

        {/* Create Project */}
        {user.role === 'Admin' && (
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>➕ New Project</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Project name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createProject()}
                style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', minWidth: 0 }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button onClick={createProject} disabled={loading} style={{
                padding: '11px 18px', borderRadius: 10, border: 'none', flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', fontWeight: 700, fontSize: 14
              }}>{loading ? '...' : 'Create'}</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
            <p style={{ fontWeight: 600, fontSize: 16 }}>No projects yet</p>
            <p style={{ fontSize: 13 }}>{user.role === 'Member' ? 'Ask your Admin to add you.' : 'Create your first project above!'}</p>
          </div>
        )}

        {/* Project cards */}
        {projects.map(p => (
          <div key={p._id} style={{
            background: 'white', borderRadius: 14, padding: '16px',
            marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {/* Project header */}
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</h3>
              <p style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Owner: {p.owner?.name}</p>
            </div>

            {/* Members */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {p.members?.map(m => {
                const isOwner = m._id === p.owner?._id;
                return (
                  <span key={m._id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 20,
                    background: isOwner ? '#eef2ff' : '#f3f4f6',
                    fontSize: 11, fontWeight: 500,
                    color: isOwner ? '#4338ca' : '#374151',
                    border: isOwner ? '1px solid #c7d2fe' : '1px solid transparent'
                  }}>
                    {isOwner ? '👑' : '👤'} {m.name}
                    {user.role === 'Admin' && !isOwner && (
                      <button onClick={() => removeMember(p._id, m._id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#dc2626', fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0
                      }}>×</button>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => navigate(`/projects/${p._id}/tasks`)} style={{
                flex: 1, minWidth: 120, padding: '9px 14px', borderRadius: 9, border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', fontWeight: 600, fontSize: 13
              }}>View Tasks</button>

              {user.role === 'Admin' && (
                <>
                  <button onClick={() => setAddingMemberTo(addingMemberTo === p._id ? null : p._id)} style={{
                    padding: '9px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${addingMemberTo === p._id ? '#10b981' : '#10b981'}`,
                    background: addingMemberTo === p._id ? '#d1fae5' : 'white', color: '#059669'
                  }}>+ Member</button>
                  <button onClick={() => deleteProject(p._id)} style={{
                    padding: '9px 12px', borderRadius: 9,
                    border: '1.5px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: 16
                  }}>🗑</button>
                </>
              )}
            </div>

            {/* Add member input */}
            {addingMemberTo === p._id && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <input
                  placeholder="Member's email"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addMember(p._id)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1.5px dashed #a5b4fc', fontSize: 13, outline: 'none', minWidth: 0 }}
                  autoFocus
                />
                <button onClick={() => addMember(p._id)} style={{
                  padding: '10px 14px', borderRadius: 8, border: 'none',
                  background: '#10b981', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0
                }}>Add</button>
                <button onClick={() => { setAddingMemberTo(null); setMemberEmail(''); }} style={{
                  padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', flexShrink: 0
                }}>✕</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}