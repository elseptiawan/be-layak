var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var User = require('../models');

// POST /auth/login
exports.login = function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if (!user) {
            return res.status(404).json({
                title: 'Login failed',
                error: { message: 'User not found' }
            });
        }
        // compare password, if not correct
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({
                title: 'Login failed',
                error: { message: 'Invalid login credentials' }
            });
        }
        // create token
        var token = jwt.sign({ user: user }, process.env.API_SECRET, { expiresIn: 86400 });
        res.status(200).json({
            message: 'Successfully logged in',
            token: token,
            userId: user._id
        });
    });
}