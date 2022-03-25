var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const signupValidationSchema = [
  body('fname')
    .exists()
    .trim()
    .isLength({ min: 3 })
    .isAlpha()
    .withMessage('Your name can only consist of alphabetical characters.')
    .escape(),
  body('lname')
    .exists()
    .trim()
    .isLength({ min: 3 })
    .isAlpha()
    .withMessage('Your name can only consist of alphabetical characters.')
    .escape(),
  body('username', 'Username cannot be empty.')
    .exists()
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('password').exists().trim().isLength({ min: 3 }).escape(),
  body('rpassword')
    .exists()
    .custom((value, { req }) => value === req.body.password)
    .trim()
    .isLength({ min: 3 })
    .escape(),
];

const loginValidation = [
  body('username', 'Username cannot be empty.')
    .exists()
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('password').exists().trim().isLength({ min: 3 }).escape(),
];
/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */

const localStrategy = new LocalStrategy((username, password, done) => {
  console.log('using local strategy');
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect Username' });
    }
    bcrypt.compareSync(password, user.hash, (err, res) => {
      console.log('comparing passwords');
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

/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username, in order to
 * fetch todo records and render the user element in the navigation bar, that
 * information is stored in the session.
 */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const isAuth = (req, res, next) => {
  //   if (req.user) {
  //     next();
  //   }
  //   next(new Error('User not logged in'));
  next();
};

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
router.post('/logout', function (req, res, next) {
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
  res.render('signup');
});

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */

router.post('/signup', signupValidationSchema, (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    next(error);
  }

  bcryptjs.genSalt().then((salt) => {
    bcryptjs.hash(req.body.password, salt).then((hash) => {
      new User({
        name: { first: req.body.fname, last: req.body.lname },
        username: req.body.username,
        hash: hash,
        salt: salt,
      }).save((err, savedUser) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
});

router.post('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/login');
});

router.get('/user', isAuth, (req, res, next) => {
  res.render('user', { user: req.user });
});

router.get('/new-post', isAuth, (req, res, next) => {
  res.render('./forms/post-form');
});

router.post(
  '/new-post',
  isAuth,
  [
    body('title', 'A title is required.').trim().isLength({ min: 3 }).escape(),
    body('body', 'Your thought is missing!')
      .trim()
      .isLength({ min: 3, max: 200 })
      .escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    console.log('validation errors: ', errors);
    if (!errors.isEmpty()) {
      res.render('./forms/post-form', { errors: errors });
    }

    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      creatorId: req.user.id,
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

module.exports = router;
