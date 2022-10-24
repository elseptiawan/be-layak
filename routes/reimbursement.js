var express = require('express');
var router = express.Router();

const { Reimbursement } = require('../models');

router.get('/', async (req, res) => {
    const reimbursement = await Reimbursement.findAll({
        include: ["user"]
    });

    res.json(reimbursement); 
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const reimbursement = await Reimbursement.findByPk(id, {
        include: ["user"]
    });

    res.json(reimbursement || {}); 
});

module.exports = router;