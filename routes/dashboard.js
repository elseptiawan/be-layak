var express = require('express');
var router = express.Router();

const { User } = require('../models');

router.get('/', async (req, res) => {
    const user = await User.findAll({
        include: ["precenses", "leaves", "reimbursements", "company"]
    });

    res.json(user);
});

module.exports = router;