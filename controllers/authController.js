const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/unauthorized');
};

exports.getUnauthorized = (req, res) => {
  res.render('unauthorized');
};

exports.getLogout = (req, res, next) => {
  req.logout();
  res.redirect('/');
};

exports.getSignup = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('template', { partial: 'signup', data: {} });
};

exports.postSignup = (req, res, next) => {
  User.exists({ username: req.body.username }).exec((err, exists) => {
    if (err) {
      return next(err);
    }
    if (exists) {
      const error = new Error('This username is already taken.');
      res.render('template', {
        partial: 'signup',
        data: {
          errors: [error],
          currentUser: new User({
            name: { first: req.body.fname, last: req.body.lname },
            username: req.body.username,
          }),
        },
      });
    } else {
      bcrypt.genSalt().then((salt) => {
        bcrypt.hash(req.body.password, salt).then((hash) => {
          new User({
            name: { first: req.body.fname, last: req.body.lname },
            username: req.body.username,
            hash: hash,
            salt: salt,
          }).save((err, savedUser) => {
            if (err) {
              return next(err);
            }
            req.login(savedUser, (err) => {
              if (err) {
                return next(err);
              }
              res.redirect('/');
            });
          });
        });
      });
    }
  });
};
