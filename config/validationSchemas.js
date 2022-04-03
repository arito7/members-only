require('dotenv').config();
const { body, validationResult } = require('express-validator');

exports.signupValidationSchema = [
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

exports.passcodeValidationSchema = [body('secret').trim().escape()];

exports.postValidationSchema = [
  body('title', 'A title is required.').trim().isLength({ min: 3, max: 30 }),
  body('body', 'Your thought is missing!')
    .trim()
    .isLength({ min: 3, max: 200 }),
];

exports.loginValidationSchema = [
  body('username', 'Username cannot be empty.')
    .exists()
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('password').exists().trim().isLength({ min: 3 }).escape(),
];

exports.adminUpgradeCodeValidationSchema = [
  body('admin-upgrade-password')
    .exists()
    .trim()
    .custom((val) => val === process.env.ADMIN_CODE)
    .escape(),
];

exports.checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.status(403);
  return res.json({ message: 'Validation error', errors: errors.array() });
};
