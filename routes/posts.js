const { Router } = require('express');
const { deletePost } = require('../controllers/postController');
const posts = Router();

/**
 * Root is /posts
 */

posts.get('/delete/:id', deletePost);

module.exports = posts;
