import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  // Register a new account
  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setInfo(data.message);
      setMode('login'); // send them to log in with their new account
    } catch (err) {
      setError('Could not reach the server.');
    }
  };

  // Log in: send credentials, store the returned JWT
  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setProfileMessage('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setToken(data.token); // save the wristband
    } catch (err) {
      setError('Could not reach the server.');
    }
  };

  // Call the protected route, attaching the token in the Authorization header
  const handleFetchProfile = async () => {
    resetMessages();

    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setProfileMessage(data.message);
    } catch (err) {
      setError('Could not reach the server.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setProfileMessage('');
    resetMessages();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetMessages();
  };

  // Logged in view: show token + protected route button
  if (token) {
    return (
      <div className="app">
        <h1>JWT Demo</h1>
        <div className="card">
          <p className="token-box">Token: {token.slice(0, 30)}...</p>
          <button onClick={handleFetchProfile}>Get Protected Profile</button>
          <button onClick={handleLogout} className="secondary">Log Out</button>
          {profileMessage && <p className="success">{profileMessage}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  // Logged out view: show login or register form
  return (
    <div className="app">
      <h1>JWT Demo</h1>

      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="card">
        <h2>{mode === 'login' ? 'Log In' : 'Register'}</h2>

        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit">{mode === 'login' ? 'Log In' : 'Create Account'}</button>

        {info && <p className="success">{info}</p>}
        {error && <p className="error">{error}</p>}
      </form>

      <p className="switch-link" onClick={switchMode}>
        {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log in'}
      </p>
    </div>
  );
}

export default App;