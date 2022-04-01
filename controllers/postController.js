const Post = require('../models/Post');

exports.deletePost = (req, res, next) => {
  Post.findByIdAndDelete(req.params.id).exec((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};
