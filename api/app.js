const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const User = require('./models/user'); // Replace with the path to your User model
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Require your mongoose configuration
const mongoose = require('./mongoose');

// Configure Passport.js session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// Define the Facebook authentication strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email'],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ facebookId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      facebookId: profile.id,
      name: profile.displayName,
      email: profile.emails ? profile.emails[0].value : null,
    });

    await newUser.save();

    return done(null, newUser);
  } catch (err) {
    console.error(err.stack);
    return done(err);
  }
}));

// Serialize user object to store in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user object from the session
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Redirect the user to Facebook for authentication
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// Callback route after Facebook has authenticated the user
app.get('/auth/facebook/callback',
  async (req, res, next) => {
    try {
      await passport.authenticate('facebook', { failureRedirect: '/' })(req, res, next);
      res.redirect('/profile');
    } catch (err) {
      console.error(err.stack);
      res.status(500).send('Facebook authentication failed.');
    }
  }
);

// Route for local authentication
app.post('/auth/local', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: true,
}));

// Route to display user profile
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  res.send(`Welcome, ${req.user.name}!<br>Email: ${req.user.email}`);
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Custom error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

