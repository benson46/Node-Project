const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const nocache = require('nocache');
const app = express();


const logger = (req, res, next) => {
  console.log('middleware');
  // res.send("hellow")
  next();
  
}

app.use(logger)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Use nocache middleware to prevent caching
app.use(nocache());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // Session expires after 1 minute for testing purposes
}));

let predefinedUser = {
  username: 'benson',
  password: 'pass123'
};

// Middleware to prevent back button from showing restricted pages
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// Route for the root
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

// Route for the login page
app.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home');
  } else {
    res.render('login', { message: '' });
  }
});

// Handle login POST request
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === predefinedUser.username && password === predefinedUser.password) {
    req.session.loggedIn = true;
    res.redirect('/home');
  } else {
    res.render('login', { message: 'Incorrect username or password' });
  }
});

// Route for the home page
app.get('/home', (req, res) => {
  if (req.session.loggedIn) {
    res.render('home', { username: predefinedUser.username });
  } else {
    res.redirect('/login');
  }
});

// Handle signout POST request
app.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/login');
  });
});





app.listen(3010, () => {
  console.log('Server is running on http://localhost:3010');
});