const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const localStrategy = new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect Username' });
    }
    bcrypt.compareSync(password, user.hash, (err, res) => {
      if (res) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect Password' });
      }
    });
    return done(null, user);
  });
});

passport.use(localStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
