import { useState } from 'react';
import Login from './pages/Login';
import Voters from './pages/Voters';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  // Decode JWT to get role
  function decodeRole(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  const handleLogin = (t: string) => {
    setToken(t);
    localStorage.setItem('token', t);
    const r = decodeRole(t);
    setRole(r);
    if (r) localStorage.setItem('role', r);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div className="main-bg">
      <header className="main-header">
        <div className="header-content">
          <h1>Political Canvassing Database</h1>
          <div className="header-actions">
            <span className="role-badge">Role: {role}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Voters token={token} role={role} />
        {/* Add navigation and other pages here */}
      </main>
    </div>
  );
}

export default App;