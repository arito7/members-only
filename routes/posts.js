const { Router } = require('express');
const { deletePost, postPost } = require('../controllers/postController');
const { isAuth } = require('../controllers/authController');
const { postValidationSchema } = require('../config/validationSchemas');
const posts = Router();

/**
 * Root is /posts
 */

posts.post('/', isAuth, postValidationSchema, postPost);

posts.get('/delete/:id', deletePost);

module.exports = posts;
