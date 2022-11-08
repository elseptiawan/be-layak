var express = require('express');
var router = express.Router(), 
{
login,
logout,
forgotPassword,
resetPassword,
} = require('../controllers/auth.controller');
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

/* Post Login */
router.post('/login', login);

/* Post Logout */
router.post('/logout', verifyToken, checkUser, logout);

/* Post Forgot Password */
router.post('/forgot-password', forgotPassword);

/* Post Reset Password */
router.post('/reset-password', resetPassword);

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.send('respond with a resource');
});

module.exports = router;
