import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import useToast from '../components/useToast';
import Logo from '../components/Logo';

export default function Tasks() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'Todo', dueDate: '', assignedTo: '' });
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    const res = await api.get(`/tasks/${id}`);
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
    if (user.role === 'Admin') api.get(`/tasks/members/${id}`).then(r => setMembers(r.data));
  }, [id]);

  const createTask = async () => {
    if (!form.title) return showToast('Task title is required', 'error');
    if (!form.assignedTo) return showToast('Please assign this task', 'error');
    setLoading(true);
    try {
      await api.post('/tasks', { ...form, project: id });
      setForm({ title: '', description: '', status: 'Todo', dueDate: '', assignedTo: '' });
      setShowForm(false);
      fetchTasks();
      showToast('Task created!');
    } catch { showToast('Failed to create task', 'error'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchTasks(); showToast('Status updated!', 'info');
  };

  const reassignTask = async (taskId, assignedTo) => {
    await api.put(`/tasks/${taskId}`, { assignedTo });
    fetchTasks(); showToast('Task reassigned!', 'info');
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    fetchTasks(); showToast('Task deleted', 'info');
  };

  const isOverdue = t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done';

  const statusStyle = {
    'Todo':        { bg: '#fef3c7', color: '#92400e' },
    'In Progress': { bg: '#dbeafe', color: '#1e40af' },
    'Done':        { bg: '#d1fae5', color: '#065f46' },
  };

  const filters = ['All', 'Todo', 'In Progress', 'Done', 'Overdue'];
  const countFor = f => f === 'All' ? tasks.length : f === 'Overdue' ? tasks.filter(isOverdue).length : tasks.filter(t => t.status === f).length;
  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Overdue') return isOverdue(t);
    return t.status === filter;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f7' }}>
      {toast && <Toast {...toast} onClose={hideToast} />}

      {/* Navbar */}
      <div style={{
        background: 'white', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/projects')} style={{
            padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb',
            background: 'white', fontWeight: 600, fontSize: 12, color: '#374151'
          }}>← Back</button>
          <Logo size={26} />
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: user.role === 'Admin' ? '#fef3c7' : '#dbeafe',
          color: user.role === 'Admin' ? '#92400e' : '#1e40af'
        }}>
          {user.role === 'Admin' ? '👑' : '👤'} {user.role}
        </span>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Tasks</h2>
          {user.role === 'Admin' && (
            <button onClick={() => setShowForm(!showForm)} style={{
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: showForm ? '#e5e7eb' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: showForm ? '#374151' : 'white', fontWeight: 700, fontSize: 13
            }}>
              {showForm ? '✕ Cancel' : '➕ New Task'}
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {user.role === 'Admin' && showForm && (
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Create & Assign Task</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input placeholder="Task title *" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <input placeholder="Description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: 4 }}>ASSIGN TO *</label>
                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14 }}>
                  <option value="">-- Select Member --</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name} — {m.role}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: 4 }}>STATUS</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '11px 10px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                    <option>Todo</option><option>In Progress</option><option>Done</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, display: 'block', marginBottom: 4 }}>DUE DATE</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '11px 10px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13 }} />
                </div>
              </div>
              <button onClick={createTask} disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', fontWeight: 700, fontSize: 15
              }}>{loading ? 'Creating...' : 'Create Task →'}</button>
            </div>
          </div>
        )}

        {/* Filter Tabs — scrollable on mobile */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
              border: `1.5px solid ${filter === f ? '#667eea' : '#e5e7eb'}`,
              background: filter === f ? '#667eea' : 'white',
              color: filter === f ? 'white' : '#374151',
              fontWeight: 600, fontSize: 12
            }}>
              {f} <span style={{
                marginLeft: 4, padding: '1px 6px', borderRadius: 10,
                background: filter === f ? 'rgba(255,255,255,0.3)' : '#f3f4f6', fontSize: 10
              }}>{countFor(f)}</span>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>No tasks here</p>
            <p style={{ fontSize: 12 }}>{user.role === 'Member' ? 'No tasks assigned to you.' : 'Create one above!'}</p>
          </div>
        )}

        {/* Task Cards */}
        {filteredTasks.map(t => (
          <div key={t._id} style={{
            background: 'white', borderRadius: 12, padding: '14px 16px',
            marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${isOverdue(t) ? '#dc2626' : t.status === 'Done' ? '#10b981' : t.status === 'In Progress' ? '#3b82f6' : '#f59e0b'}`
          }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <strong style={{ fontSize: 14, wordBreak: 'break-word' }}>{t.title}</strong>
                  <span style={{
                    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    background: statusStyle[t.status].bg, color: statusStyle[t.status].color,
                    whiteSpace: 'nowrap'
                  }}>{t.status}</span>
                  {isOverdue(t) && (
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#dc2626', whiteSpace: 'nowrap' }}>⚠️ Overdue</span>
                  )}
                </div>
                {t.description && <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>{t.description}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#6b7280' }}>
                  <span>👤 <strong style={{ color: '#1a1d23' }}>{t.assignedTo?.name || 'Unassigned'}</strong></span>
                  {t.dueDate && <span style={{ color: isOverdue(t) ? '#dc2626' : '#6b7280' }}>
                    📅 {new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            {(user.role === 'Admin' || t.assignedTo?._id === user.id) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                <select value={t.status} onChange={e => updateStatus(t._id, e.target.value)}
                  style={{ flex: 1, minWidth: 120, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 12 }}>
                  <option>Todo</option><option>In Progress</option><option>Done</option>
                </select>
                {user.role === 'Admin' && (
                  <>
                    <select value={t.assignedTo?._id || ''} onChange={e => reassignTask(t._id, e.target.value)}
                      style={{ flex: 1, minWidth: 120, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 12 }}>
                      <option value="">🔄 Reassign</option>
                      {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                    <button onClick={() => deleteTask(t._id)} style={{
                      padding: '8px 12px', borderRadius: 8, border: '1.5px solid #fca5a5',
                      background: '#fff5f5', color: '#dc2626', fontWeight: 600, fontSize: 12
                    }}>🗑</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}