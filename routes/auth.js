require('dotenv').config();
const express = require('express');
const passport = require('passport');
const auth = express.Router();
const validationSchemas = require('../config/validationSchemas');
const {
  isAuth,
  getUnauthorized,
  getLogout,
  getSignup,
  postSignup,
} = require('../controllers/authController');

auth.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

auth.get('/unauthorized', getUnauthorized);

auth.get('/login', function (req, res, next) {
  if (req.user) {
    return res.redirect('/user');
  }
  return res.render('template', { partial: 'login', data: {} });
});

auth.post(
  '/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/users',
    failureRedirect: '/login',
    failureMessage: true,
  })
);

auth.get('/logout', getLogout);

auth.get('/signup', getSignup);

auth.post(
  '/signup',
  validationSchemas.signupValidationSchema,
  validationSchemas.checkValidationResults,
  postSignup
);

module.exports = auth;
