var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var { User } = require('../models');

// POST /auth/login
// exports.login = async(req, res) => {
//     const user = await User.findOne({where: {email: req.body.email} }, function(err, user) {
//         if (err) {
//             return res.status(500).json({
//                 title: 'An error occurred',
//                 error: err
//             });
//         }
//         if (!user) {
//             return res.status(404).json({
//                 title: 'Login failed',
//                 error: { message: 'User not found' }
//             });
//         }
//         // compare password, if not correct
//         if (!bcrypt.compareSync(req.body.password, user.password)) {
//             return res.status(401).json({
//                 title: 'Login failed',
//                 error: { message: 'Invalid login credentials' }
//             });
//         }
//         // create token
//         var token = jwt.sign({ user: user }, process.env.API_SECRET, { expiresIn: 86400 });
//         res.status(200).json({
//             message: 'Successfully logged in',
//             token: token,
//             userId: user._id
//         });
//     });
// }

exports.login = async(req, res) => {
    try {
        const user = await User.findOne({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compareSync(req.body.password, user.password);
        if(!match) return res.status(400).json({success: 'false', message: 'wrong password'});
        const userId = user.id;
        const nama = user.nama;
        const email = user.email;

        const token = jwt.sign({userId, nama, email}, process.env.API_SECRET, {
            expiresIn: '86400s'
        });
        
        res.json({success: 'true', token: token});
    } catch (error) {
        res.status(400).json({success: 'false', message: 'wrong email'});
    }
}