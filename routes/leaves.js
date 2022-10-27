var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');

const { Leave } = require('../models');
const v = new Validator();

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

router.post('/', async (req, res) => {
    const schema = {
        tipe_cuti: 'string',
        start_date: {
            type: "date",
            convert: true
        },
        end_date: {
            type: "date",
            convert: true
        },
        surat_cuti: 'string'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const leave = await Leave.create({
        user_id: req.body.user_id,
        tipe_cuti: req.body.tipe_cuti,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        surat_cuti: req.body.surat_cuti
    });

    res.json({success: "true", messages: "Your application for leave is success", data: leave}); 
});


module.exports = router;