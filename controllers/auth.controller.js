// var jwt = require('jsonwebtoken');
// var bcrypt = require('bcrypt');
// var User = require('../models/User');

// // POST /auth/login
// // exports.login = function(req, res) {
// async function login(req, res) {
//     User.findOne({ email: req.body.email }), function(err, User) {
//         if (err) {
//             return res.status(500).send({
//                 title: 'An error occurred',
//                 error: err
//             });
//         }
//         if (!User) {
//             return res.status(404).send({
//                 title: 'Login failed',
//                 error: { message: 'User not found' }
//             });
//         }
//         // compare password, if not correct
//         if (!bcrypt.compareSync(req.body.password, User.password)) {
//             return res.status(401).send({
//                 accessToken: null,
//                 title: 'Login failed',
//                 error: { message: 'Invalid login credentials' }
//             });
//         }
//         // create token
//         var token = jwt.sign({ user: User }, process.env.API_SECRET, { expiresIn: 86400 });
        
//         res.status(200).send({
//             success: true,
//             message: "Login successfully",
//             user: {
//                 id: User._id,
//                 email: User.email,
//                 email_verified_at: null,
//                 role: User.role,
//                 status: true,
//                 created_at: User.created_at,
//                 updated_at: User.updated_at
//             },
//             accessToken: token,
//             token_type: "Bearer"
//         });
//     };
// }