import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Search, User } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users');
      const data = await res.json();
      // Filter out admins so they only see students
      setUsers(data.filter(u => u.role === 'student'));
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleUnflag = async (userId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/unflag/${userId}`, {
        method: 'POST'
      });
      fetchUsers(); // Refresh
    } catch (err) {
      console.error('Failed to unflag user', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Counsellor Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-solid)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid #e2e8f0', width: '300px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search students..." 
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Student Name</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Total Logs</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Latest Mood</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0', background: user.flagged ? 'rgba(229, 62, 62, 0.05)' : 'transparent' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                    <User size={16} />
                  </div>
                  {user.name}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>{user.moodCount}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: user.latestMood === 'Happy' ? 'rgba(72, 187, 120, 0.2)' :
                               user.latestMood === 'Neutral' ? 'rgba(160, 174, 192, 0.2)' :
                               user.latestMood === 'Sad' ? 'rgba(237, 137, 54, 0.2)' :
                               user.latestMood === 'Stressed' ? 'rgba(229, 62, 62, 0.2)' : 'rgba(0,0,0,0.1)',
                    color: user.latestMood === 'Happy' ? 'var(--mood-happy)' :
                           user.latestMood === 'Neutral' ? 'var(--text-secondary)' :
                           user.latestMood === 'Sad' ? 'var(--mood-sad)' :
                           user.latestMood === 'Stressed' ? 'var(--mood-stressed)' : 'var(--text-primary)'
                  }}>
                    {user.latestMood}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {user.flagged ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mood-stressed)', fontWeight: '600', fontSize: '0.875rem' }}>
                      <AlertTriangle size={16} /> At Risk
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mood-happy)', fontSize: '0.875rem' }}>
                      <CheckCircle size={16} /> OK
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  {user.flagged && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                      onClick={() => handleUnflag(user.id)}
                    >
                      Mark Reviewed
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
