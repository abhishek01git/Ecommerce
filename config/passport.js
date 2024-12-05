const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/userSchema');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Fixed typo
      callbackURL: 'http://localhost:3000/auth/google/callback',

    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, proceed
          return done(null, user);
        } else {
          // Create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value, // Fixed email access
            googleId: profile.id,
          });
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error, null); // Fixed error variable name
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id); // Save the user's ID in the session
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});

module.exports = passport;
