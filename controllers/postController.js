const Post = require('../models/Post');
const { validationResult } = require('express-validator');
exports.deletePost = (req, res, next) => {
  Post.findByIdAndDelete(req.params.id).exec((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
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
};
