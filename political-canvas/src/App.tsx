import { useState } from 'react';
import Login from './pages/Login';
import Voters from './pages/Voters';
import ExitPoll from './pages/ExitPoll';
import Territories from './pages/Territories';
import MyWalklist from './pages/MyWalklist';
import './App.css';
import './ExitPoll.css';

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

  const [page, setPage] = useState<'voters' | 'exitpoll' | 'territories' | 'mywalklist'>('voters');

  if (!token) return <Login onLogin={handleLogin} />;

  const isVolunteer = role === 'volunteer';
  const canManage = role === 'admin' || role === 'manager';

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
        <nav className="main-nav">
          <button className={page === 'voters' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('voters')}>Voters</button>
          {isVolunteer && (
            <button className={page === 'mywalklist' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('mywalklist')}>My Walklist</button>
          )}
          {canManage && (
            <button className={page === 'territories' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('territories')}>Territories</button>
          )}
          <button className={page === 'exitpoll' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('exitpoll')}>Exit Poll</button>
        </nav>
      </header>
      <main className="main-content">
        {page === 'voters' && <Voters token={token} role={role} />}
        {page === 'exitpoll' && <ExitPoll token={token} />}
        {page === 'territories' && canManage && <Territories token={token} role={role} />}
        {page === 'mywalklist' && isVolunteer && <MyWalklist token={token} />}
      </main>
    </div>
  );
}

export default App;