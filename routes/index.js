var express = require('express');
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

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/signup');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', signupValidationSchema, (req, res, next) => {});

module.exports = router;
