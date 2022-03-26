var express = require('express');
var router = express.Router();
const Post = require('../models/Post');

router.get('/', (req, res, next) => {
  Post.find()
    .limit(10)
    .sort({ timestamp: -1 })
    .populate('creator')
    .exec((err, posts) => {
      if (err) {
        return next(err);
      }
      res.render('template', {
        partial: 'index',
        data: { title: 'WhoWroteDat', posts },
      });
    });
});

module.exports = router;
