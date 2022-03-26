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

/* POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 */
router.post(
  '/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/user',
    failureRedirect: '/login',
    failureMessage: true,
  })
);

/* POST /logout
 *
 * This route logs the user out.
 */
router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

/* GET /signup
 *
 * This route prompts the user to sign up.
 *
 * The 'signup' view renders an HTML form, into which the user enters their
 * desired username and password.  When the user submits the form, a request
 * will be sent to the `POST /signup` route.
 */
router.get('/signup', function (req, res, next) {
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

router.post('/:id/delete');
module.exports = router;
