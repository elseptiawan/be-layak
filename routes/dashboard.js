var express = require('express');
var router = express.Router();
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

const { User, Presence, Leave, Reimbursement, Company } = require('../models');

router.get('*', checkUser);
router.get('/', verifyToken, async (req, res) => {
    const userId = req.id;
    const user = await User.findByPk(userId, {
        // include: ["presences", "leaves", "reimbursements", "company"],
        include: [
            {
                model: Presence,
                as: 'presences',
            },
            {
                model: Leave,
                as: 'leaves',
            },
            {
                model: Reimbursement,
                as: 'reimbursements',
            },
            {
                model: Company,
                as: 'company',
            },
        ],  
        attributes: {
            exclude: ['password']
        },
        order: [
            [{model: Presence, as: 'presences'}, 'id', 'DESC'],
            [{model: Leave, as: 'leaves'}, 'id', 'DESC'],
            [{model: Reimbursement, as: 'reimbursements'}, 'id', 'DESC'],
            [{model: Company, as: 'company'}, 'id', 'DESC'],
        ]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: user});
});

module.exports = router;