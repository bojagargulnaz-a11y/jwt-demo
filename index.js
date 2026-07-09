const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());          // allow the React app (different port) to call this API
app.use(express.json());  // parse JSON request bodies

const SECRET = 'playground-secret'; // in real apps, put this in an env variable

// Fake "database" for the demo — starts empty, fills up as people register
const users = {};

// REGISTER: create a new account with a hashed password
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (users[username]) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // never store plain-text passwords
  users[username] = { password: hashedPassword };

  res.status(201).json({ message: 'Account created! You can now log in.' });
});

// LOGIN: check credentials, hand back a signed JWT (the "wristband")
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware: checks the wristband before letting the request through
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']; // expect "Bearer <token>"
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // attach decoded payload (e.g. { username })
    next();
  });
}

// PROTECTED ROUTE: only reachable with a valid token
app.get('/profile', requireAuth, (req, res) => {
  res.json({ message: `Welcome back, ${req.user.username}!` });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));