var express = require('express');
var router = express.Router(), 
{
login
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/authJWT.js');

/* Post Login */
router.post('/login', login);

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

module.exports = router;
