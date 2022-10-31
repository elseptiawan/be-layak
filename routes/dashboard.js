var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middleware/authJWT.js');

const { User } = require('../models');

router.get('/', verifyToken, async (req, res) => {
    const user = await User.findAll({
        include: ["presences", "leaves", "reimbursements", "company"]
    });

    res.json(user);
});

module.exports = router;