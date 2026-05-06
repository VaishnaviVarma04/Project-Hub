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
      setName('');
      fetchProjects();
      showToast('Project created!');
    } catch { showToast('Failed to create project', 'error'); }
    finally { setLoading(false); }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
      showToast('Project deleted', 'info');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const addMember = async (projectId) => {
    if (!memberEmail.trim()) return showToast('Enter member email', 'error');
    try {
      await api.put(`/projects/${projectId}/members`, { email: memberEmail });
      showToast('Member added successfully!');
      setMemberEmail('');
      setAddingMemberTo(null);
      fetchProjects();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to add member', 'error');
    }
  };

  const removeMember = async (projectId, userId) => {
    try {
        await api.delete(`/projects/${projectId}/members`, {
        data: { userId }   // axios delete needs body inside 'data' key
        });
        showToast('Member removed', 'info');
        fetchProjects();
    } catch (err) {
        showToast(err.response?.data?.msg || 'Failed to remove member', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f7' }}>
      {toast && <Toast {...toast} onClose={hideToast} />}

      {/* Navbar */}
      <div style={{
        background: 'white', padding: '16px 32px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <button onClick={() => navigate('/')} style={{
          padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb',
          background: 'white', fontWeight: 600, fontSize: 13, color: '#374151'
        }}>← Dashboard</button>
        <Logo size={36} />
      </div>

      <div style={{ padding: '40px 32px', maxWidth: 900, margin: '0 auto' }}>

        {/* Create Project */}
        {user.role === 'Admin' && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 24,
            marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>➕ New Project</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                placeholder="Project name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createProject()}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button onClick={createProject} disabled={loading} style={{
                padding: '12px 24px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', fontWeight: 700
              }}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📁</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No projects yet</p>
            <p style={{ fontSize: 14 }}>
              {user.role === 'Member' ? 'Ask your Admin to add you to a project.' : 'Create your first project above!'}
            </p>
          </div>
        ) : (
          projects.map(p => (
            <div key={p._id} style={{
              background: 'white', borderRadius: 16, padding: 24,
              marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ color: '#6b7280', fontSize: 13 }}>Owner: {p.owner?.name}</p>
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.members?.map(m => {
                        const isOwner = m._id === p.owner?._id;
                        return (
                        <span key={m._id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 20,
                            background: isOwner ? '#eef2ff' : '#f3f4f6',
                            fontSize: 12, color: isOwner ? '#4338ca' : '#374151', fontWeight: 500,
                            border: isOwner ? '1px solid #c7d2fe' : '1px solid transparent'
                        }}>
                            {isOwner ? '👑' : '👤'} {m.name}
                            {/* Show remove X only for non-owners and only if Admin */}
                            {user.role === 'Admin' && !isOwner && (
                            <button
                                onClick={() => removeMember(p._id, m._id)}
                                title={`Remove ${m.name}`}
                                style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#dc2626', fontWeight: 700, fontSize: 14,
                                lineHeight: 1, padding: '0 2px', marginLeft: 2
                                }}
                            >×</button>
                            )}
                        </span>
                        );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <button onClick={() => navigate(`/projects/${p._id}/tasks`)} style={{
                    padding: '9px 18px', borderRadius: 9, border: 'none',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white', fontWeight: 600, fontSize: 13
                  }}>View Tasks</button>

                  {user.role === 'Admin' && (
                    <>
                      <button
                        onClick={() => setAddingMemberTo(addingMemberTo === p._id ? null : p._id)}
                        style={{
                          padding: '9px 14px', borderRadius: 9,
                          border: '1.5px solid #10b981', background: addingMemberTo === p._id ? '#d1fae5' : 'white',
                          color: '#059669', fontWeight: 600, fontSize: 13
                        }}>+ Member</button>
                      <button onClick={() => deleteProject(p._id)} style={{
                        padding: '9px 14px', borderRadius: 9,
                        border: '1.5px solid #fca5a5', background: 'white',
                        color: '#dc2626', fontWeight: 600, fontSize: 13
                      }}>🗑</button>
                    </>
                  )}
                </div>
              </div>

              {/* Add Member inline */}
              {addingMemberTo === p._id && (
                <div style={{
                  marginTop: 16, padding: 16, background: '#f8fafc',
                  borderRadius: 10, border: '1.5px dashed #c7d2fe',
                  display: 'flex', gap: 10
                }}>
                  <input
                    placeholder="Member's email address"
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addMember(p._id)}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#667eea'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    autoFocus
                  />
                  <button onClick={() => addMember(p._id)} style={{
                    padding: '10px 18px', borderRadius: 8, border: 'none',
                    background: '#10b981', color: 'white', fontWeight: 700
                  }}>Add</button>
                  <button onClick={() => { setAddingMemberTo(null); setMemberEmail(''); }} style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280'
                  }}>Cancel</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}