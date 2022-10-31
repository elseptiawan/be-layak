var jwt = require('jsonwebtoken');
User = require("../models/User");

const verifyToken = (req, res, next) => {
    // let token = req.headers["x-access-token"];
    
    // if (!token) {
    //     return res.status(403).send({ message: "No token provided!" });
    // }
    
    // jwt.verify(token, process.env.SECRET, (err, decoded) => {
    //     if (err) {
    //     return res.status(401).send({ message: "Unauthorized!" });
    //     }
    //     req.userId = decoded.id;
    //     next();
    // });

    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        var token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.API_SECRET, (err, decoded) => {
            if (err) req.user = undefined;
            User.findOne({ _id: decoded.user._id }, function(err, User) {
            if (err) {
                return res.status(401).send({ message: err });
            } else {
                req.userId = decoded.id;
                next();
            }
        })
        });
    } else {
        req.user = undefined;
        next();
    }
};

// module.exports = verifyToken;



// Check if user is logged in or not
// const User=require('./../models/user');

// let auth =(req,res,next)=>{
//     let token =req.cookies.auth;
//     User.findByToken(token,(err,user)=>{
//         if(err) throw err;
//         if(!user) return res.json({
//             error :true
//         });

//         req.token= token;
//         req.user=user;
//         next();

//     })
// }

// module.exports={auth};