var express = require('express');
var router = express.Router();
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

const { User } = require('../models');

router.get('*', checkUser);
router.get('/', verifyToken, async (req, res) => {
    const userId = req.id;
    const user = await User.findByPk(userId, {
        include: ["presences", "leaves", "reimbursements", "company"],
        attributes: {
            exclude: ['password']
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: user});
});

module.exports = router;