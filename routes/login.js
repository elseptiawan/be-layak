var express = require('express');
var router = express.Router(), 
{
  login
} = require('../controllers/auth.controller');

/* Post Login */
router.post('/login', login, function(req, res, next) {
  res.send('respond with a resource');  
});

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

module.exports = router;
