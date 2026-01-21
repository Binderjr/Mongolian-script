const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const port = 3000;

const usersFilePath = path.join(__dirname, 'users.json');
const userGlyphsFilePath = path.join(__dirname, 'user_glyphs.json');

app.use(express.json());
app.use(express.static('../frontend'));

app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Facebook OAuth Strategy
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'; // Replace with your App ID
const FACEBOOK_APP_SECRET = 'YOUR_FACEBOOK_APP_SECRET'; // Replace with your App Secret

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // In a real application, you would find or create a user in your database
    // based on the Facebook profile information.
    // For this example, we'll just return the profile.
    return cb(null, profile);
  }
));

// Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session.user || req.isAuthenticated()) { // Check for local user or Facebook user
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Helper to read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(usersFilePath, JSON.stringify([]));
      return [];
    }
    throw error;
  }
}

// Helper to write users to file
async function writeUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

// Helper to read user glyphs from file
async function readUserGlyphs() {
    try {
        const data = await fs.readFile(userGlyphsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(userGlyphsFilePath, JSON.stringify([]));
            return [];
        }
        throw error;
    }
}

// Helper to write user glyphs to file
async function writeUserGlyphs(glyphs) {
    await fs.writeFile(userGlyphsFilePath, JSON.stringify(glyphs, null, 2));
}

// User Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = await readUsers();

  if (users.find(user => user.username === username)) {
    return res.status(400).send('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, password: hashedPassword };
  users.push(newUser);
  await writeUsers(users);

  res.status(201).send('User registered successfully');
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = await readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(400).send('Invalid username or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send('Invalid username or password');
  }

  req.session.user = { username: user.username };
  res.send('Logged in successfully');
});

// User Logout
app.post('/logout', (req, res) => {
    req.logout(function(err) { // Passport's logout method
        if (err) { return next(err); }
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Could not log out, please try again');
            }
            res.send('Logged out successfully');
        });
    });
});

// Check if user is logged in
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, username: req.session.user.username });
    } else if (req.isAuthenticated()) {
        res.json({ authenticated: true, username: req.user.displayName });
    }
    else {
        res.json({ authenticated: false });
    }
});

// Facebook Auth Routes
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.user = { username: req.user.displayName, id: req.user.id }; // Store Facebook user info
    res.redirect('/');
  });


// Save user-specific glyphs
app.post('/save-glyphs', isAuthenticated, async (req, res) => {
    const { glyphs } = req.body;
    const username = req.session.user ? req.session.user.username : req.user.displayName; // Get username from session or Facebook profile
    const allUserGlyphs = await readUserGlyphs();

    const userGlyphIndex = allUserGlyphs.findIndex(ug => ug.username === username);

    if (userGlyphIndex > -1) {
        allUserGlyphs[userGlyphIndex].glyphs = glyphs;
    } else {
        allUserGlyphs.push({ username, glyphs });
    }
    await writeUserGlyphs(allUserGlyphs);
    res.send('Glyphs saved successfully');
});

// Load user-specific glyphs
app.get('/load-glyphs', isAuthenticated, async (req, res) => {
    const username = req.session.user ? req.session.user.username : req.user.displayName; // Get username from session or Facebook profile
    const allUserGlyphs = await readUserGlyphs();
    const userGlyphs = allUserGlyphs.find(ug => ug.username === username);

    if (userGlyphs) {
        res.json(userGlyphs.glyphs);
    } else {
        res.json({}); // Return empty object if no glyphs found for user
    }
});


app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '../frontend' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});