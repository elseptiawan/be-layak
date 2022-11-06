const jwt = require("jsonwebtoken");
const {User} = require("../models");

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.status(401).json({success: 'false', message: 'unauthorized'});;
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