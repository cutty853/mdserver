const express = require('express');
const passport = require('passport');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('login');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', function (req, res) {
  res.render('login');
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post('/register', function (req, res) {
  res.render('register');
});


module.exports = router;
