const jwt = require("jsonwebtoken");
const {User} = require("../models");

// const verifyToken = (req, res, next) => {
//     let token = req.headers["x-access-token"];
    
//     if (!token) {
//         return res.status(403).send({ message: "No token provided!" });
//     }
    
//     jwt.verify(token, process.env.SECRET, (err, decoded) => {
//         if (err) {
//         return res.status(401).send({ message: "Unauthorized!" });
//         }
//         req.userId = decoded.id;
//         next();
//     });
// }

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.status(401).json({success: 'false', meessage: 'unauthorized'});;
    jwt.verify(token, process.env.API_SECRET, (err, decoded) => {
        if(err) return res.sendStatus(403);
        req.email = decoded.email;
        next();
    });
}

exports.checkUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.status(401).json({success: 'false', message: 'unauthorizes'});
    jwt.verify(token, process.env.API_SECRET, async (err, decoded) => {
        if(err) return res.status(403).json({success: 'false', message: err.message});
        let user = await User.findByPk(decoded.userId);
        req.id = user.id;
        next();
    });
}