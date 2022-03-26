require('dotenv').config();
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const router = express.Router();
const validationSchemas = require('../config/validationSchemas');
const { validationResult } = require('express-validator');

router.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/unauthorized');
};

router.get('/unauthorized', (req, res, next) => {
  res.render('unauthorized');
});

router.get('/login', function (req, res, next) {
  if (req.user) {
    res.redirect('/user');
  }
  res.render('login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/user',
    failureRedirect: '/login',
    failureMessage: true,
  })
);

router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/signup', function (req, res, next) {
  if (req.isAuthenticated) {
    res.redirect('/');
  }
  res.render('template', { partial: 'signup', data: {} });
});

router.post(
  '/signup',
  validationSchemas.signupValidationSchema,
  (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return next(error);
    }

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
  }
);

router.get('/user', isAuth, (req, res, next) => {
  res.render('template', { partial: 'user', data: {} });
});

router.get('/new-post', isAuth, (req, res, next) => {
  res.render('template', { partial: 'post-form', data: {} });
});

router.post(
  '/new-post',
  isAuth,
  validationSchemas.postValidationSchema,
  (req, res, next) => {
    const errors = validationResult(req);
    console.log('validation errors: ', errors);
    if (!errors.isEmpty()) {
      res.render('./forms/post-form', { errors: errors });
    }

    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      creator: req.user.id,
    });

    newPost.save((err) => {
      console.log('new post saved successfully');
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
);

router.post(
  '/upgrade',
  validationSchemas.passcodeValidationSchema,
  (req, res, next) => {
    if (process.env.PASSCODE === req.body.secret) {
      User.findByIdAndUpdate(req.user.id, { membershipStatus: 'member' }).exec(
        (err) => {
          if (err) {
            return next(err);
          }
          res.render('user', {
            messages: [
              {
                type: 'success',
                message: 'Congratulation You are now a member!',
              },
            ],
          });
        }
      );
    }
  }
);

/**
 * ADMIN
 */
router.get('/admin', (req, res, next) => {
  res.render('admin');
});

router.post(
  '/admin',
  validationSchemas.adminUpgradeCodeValidationSchema,
  (req, res, next) => {
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
  }
);

router.get('/post/delete/:id', (req, res, next) => {
  Post.findByIdAndDelete(req.params.id).exec((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
