# Simple JWT Authentication Playground

A minimal, full-stack demonstration of JSON Web Token (JWT) authentication using an **Express** backend and a **React** frontend. This project demonstrates how to authenticate a user, issue a JWT token, and use that token for subsequent authenticated requests.

## Project Structure

```text
├── backend/
│   ├── index.js          # Express API server
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx       # React application component
    │   └── App.css       # Frontend styling
    └── package.json
Getting Started
1. Backend Setup
Navigate to the backend directory:

Bash
cd backend
Install the dependencies:

Bash
npm install express cors jsonwebtoken
Create your index.js file using the server code below.

Start the server:

Bash
node index.js
The server will run on http://localhost:5000.

2. Frontend Setup
Navigate to the frontend directory:

Bash
cd ../frontend
Install dependencies (assuming a standard Vite or Create React App environment):

Bash
npm install
Replace the contents of your src/App.jsx and src/App.css with the provided code below.

Start the development server:

Bash
npm run dev
The frontend will typically run on http://localhost:5173 or http://localhost:3000.

Code Implementation
Backend (backend/index.js)
JavaScript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());          
app.use(express.json());  

const SECRET = 'playground-secret'; 

// Fake user database
const users = {
  alice: { password: '1234' }
};

// LOGIN: Check credentials, hand back a signed JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username]?.password === password) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// PROTECTED ROUTE: Example resource requiring a token
app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
    res.json({ message: `Welcome to your dashboard, ${user.username}!` });
  });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
Frontend (frontend/src/App.jsx)
JavaScript
import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('1234');
  const [token, setToken] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setProfileMessage('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      setProfileMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <h2>JWT Auth Playground</h2>
      <div className="card">
        {!token ? (
          <form onSubmit={handleLogin} className="card">
            <label>
              Username:
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
            </label>
            <label>
              Password:
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <button type="submit">Log In</button>
          </form>
        ) : (
          <div>
            <p>✅ Logged In!</p>
            <div className="token-box"><strong>Token:</strong> {token}</div>
            <button onClick={fetchProfile} style={{ marginTop: '10px' }}>Fetch Protected Profile</button>
            <button onClick={() => setToken(null)} className="secondary" style={{ marginTop: '10px', marginLeft: '5px' }}>Log Out</button>
          </div>
        )}

        {profileMessage && <p style={{ color: 'green' }}>{profileMessage}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}

export default App;
Styling (frontend/src/App.css)
CSS
.app {
  max-width: 360px;
  margin: 60px auto;
  font-family: system-ui, sans-serif;
  text-align: center;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fafafa;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  font-size: 14px;
}

input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

button {
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

button.secondary {
  background: #6b7280;
}

button:hover {
  opacity: 0.9;
}

.token-box {
  font-size: 12px;
  word-break: break-all;
  background: #eee;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  text-align: left;
}
Key Concepts Demonstrated
JWT Generation: The backend uses jwt.sign() to issue a token containing user identity payload that expires in 1 hour.

CORS Middleware: Allows cross-origin requests since the frontend and backend run on different ports.

Authorization Headers: The client uses the Bearer <token> conven
