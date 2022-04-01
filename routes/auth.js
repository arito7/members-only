require('dotenv').config();
const express = require('express');
const passport = require('passport');
const Post = require('../models/Post');
const router = express.Router();
const validationSchemas = require('../config/validationSchemas');
const { validationResult } = require('express-validator');
const {
  isAuth,
  getUnauthorized,
  getLogout,
  getSignup,
  postSignup,
} = require('../controllers/authController');

router.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

router.get('/unauthorized', getUnauthorized);

router.get('/login', function (req, res, next) {
  if (req.user) {
    return res.redirect('/user');
  }
  return res.render('login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/user',
    failureRedirect: '/login',
    failureMessage: true,
  })
);

router.get('/logout', getLogout);

router.get('/signup', getSignup);

router.post(
  '/signup',
  validationSchemas.signupValidationSchema,
  validationSchemas.checkValidationResults,
  postSignup
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
