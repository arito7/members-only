require('dotenv').config();
const express = require('express');
const users = express.Router();
const {
  adminUpgradeCodeValidationSchema,
  passcodeValidationSchema,
} = require('../config/validationSchemas');
const User = require('../models/User');
const { validationResult } = require('express-validator');

users.get('/', (req, res, next) => {
  res.render('template', { partial: 'user', data: {} });
});

users.get('/admin', (req, res, next) => {
  res.render('template', { partial: 'admin', data: {} });
});

users.post('/admin', adminUpgradeCodeValidationSchema, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.errors);
    res.render('admin');
  }
  User.findByIdAndUpdate(req.user.id, { admin: true }).exec((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/user');
  });
});

users.post('/upgrade', passcodeValidationSchema, (req, res, next) => {
  if (process.env.PASSCODE === req.body.secret) {
    User.findByIdAndUpdate(req.user.id, { membershipStatus: 'member' }).exec(
      (err, user) => {
        if (err) {
          return next(err);
        }
        res.locals.currentUser = user;
        res.render('template', {
          partial: 'user',
          data: {
            messages: [
              {
                type: 'success',
                message: 'Congratulation You are now a member!',
              },
            ],
          },
        });
      }
    );
  }
});

module.exports = users;
