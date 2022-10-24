var express = require('express');
var router = express.Router();

const { Leave } = require('../models');

router.get('/', async (req, res) => {
    const leave = await Leave.findAll({
        include: ["user"]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: leave}); 
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const leave = await Leave.findByPk(id, {
        include: ["user"]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: leave || {}}); 
});


module.exports = router;