import React, { useState } from 'react';
import { login, register } from '../api';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('volunteer');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        const res = await register(username, password, role);
        if (res.error) setError(res.error);
        else setIsRegister(false);
      } else {
        const res = await login(username, password);
        if (res.token) onLogin(res.token);
        else setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="voters-container" style={{ maxWidth: 400, margin: '64px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{isRegister ? 'Register' : 'Login'}</h2>
      <form className="voter-form" style={{ flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
        <input
          className="voter-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          className="voter-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {isRegister && (
          <select
            className="voter-input"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          >
            <option value="volunteer">Volunteer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <button className="voter-btn" type="submit" style={{ width: '100%', marginTop: 8 }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <button
        className="voter-btn cancel-btn"
        style={{ width: '100%', marginTop: 12 }}
        onClick={() => setIsRegister(r => !r)}
      >
        {isRegister ? 'Already have an account? Login' : 'No account? Register'}
      </button>
      {error && <div className="error" style={{ color: '#e74c3c', marginTop: 16, textAlign: 'center' }}>{error}</div>}
    </div>
  );
}
