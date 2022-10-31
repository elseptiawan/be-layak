// var express = require('express');
// var router = express.Router(), 
// {
//   login
// } = require('../controllers/auth.controller.js');
// var verifyToken = require('../middlewares/authJWT.js');

// /* Post Login */
// router.post('/login', login, function(req, res, next) {
//   // res.send('respond with a resource');  
// });

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   // res.send('respond with a resource');
// });

// router.get("/hiddencontent", verifyToken, (req, res) => {
//   if (!User) {
//     return res.status(403).send({ message: "Unauthorized!" });
//   }
//   if (User.role === "admin") {
//     res.status(200).send("Admin Content.");
//   } else {
//     res.status(403).send("Unauthorized!");
//   }
// });

// module.exports = router;

var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var jwt = require('jsonwebtoken');

const { User } = require('../models');
const { combineTableNames } = require('sequelize/types/utils');

const v = new Validator();

router.post('/login', async (req, res) => {
  const schema = {
    email: 'string',
    password: 'string',
  }

  const validate =v.validate(req.body, schema);

  if(validate.length){
    return res.status(400).json(validate);
  }

  const user = await User.findOne({email: req.body.email});
  
  if(!user){
    return res.status(404).json({success: "false", messages: "User not found", data: {}});
  } else {
    if(bcrypt.compareSync(req.body.password, user.password)){
      res.json({
        success: "true", 
        messages: "Login successfully", 
        data: {
          id: user.id,
          email: user.email,
          email_verified_at: null,
          role: user.role,
          status: true,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        accessToken: token,
        tokenType: "Bearer"
      });
    } else {
      res.json({
        success: "false", 
        messages: "Invalid login credentials", 
        data: {}
      });
    }
  }

  // create token
  var token = jwt.sign({ user: user }, process.env.API_SECRET, { expiresIn: 86400 });

  user.token = token;
  // await user.save(function(err, user) {
  //   if (err) return cb(err);
  //   cb(null, user);
  // });

  userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: user._id,
      email: user.email,
      exp: parseInt(expiry.getTime() / 1000),
    }, process.env.API_SECRET); 
  };

  jwt.verify(token, process.env.API_SECRET, function(err, decoded) {
    if (err) {
      return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });    
    } else {
      req.decoded = decoded;    
      next();
    }
  });
});

router.post('/logout', async (req, res) => {
  userSchema.methods.deleteJwt = function(token) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() - 7);
  };

  res.json({
    success: "true",
    messages: "Logout successfully",
    data: {}
  });
});

router.post('/forgot', async (req, res) => {
  const schema = {
    email: 'string',
  }

  const validate =v.validate(req.body, schema);

  if(validate.length){
    return res.status(400).json(validate);
  }

  const user = await User.findOne({email: req.body.email});
  
  if(!user){
    return res.status(404).json({success: "false", messages: "User not found", data: {}});
  } else {
    res.json({
      success: "true", 
      messages: "Reset password link sent to your email", 
      data: {}
    });
  }
});

router.post('/reset', async (req, res) => {
  res.send('respond with a resource');
});

module.exports = router;