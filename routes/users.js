var express = require('express');
var users = express.Router();

users.get('/', (req, res, next) => {
  res.render('template', { partial: 'user', data: {} });
});

users.get('/admin', (req, res, next) => {
  res.render('template', { partial: 'admin', data: {} });
});

module.exports = users;
