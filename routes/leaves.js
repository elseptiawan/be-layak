var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const multer = require('multer');

const { Leave } = require('../models');
const v = new Validator();

const multerDiskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Storages/Leaves');
    },
    filename: function(req, file, cb) {
        const originalName = file.originalname;
        const nameArr = originalName.split('.');
        var extension = '';
        if (nameArr.length > 1){
            extension = nameArr[nameArr.length - 1];
        }

        cb(null, file.fieldname +'-'+ Date.now() +'-'+ extension);
    }
});

const multerUpload = multer({storage: multerDiskStorage});

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

router.post('/', multerUpload.single('surat_cuti'), async (req, res) => {
    const schema = {
        tipe_cuti: 'string',
        start_date: {
            type: "date",
            convert: true
        },
        end_date: {
            type: "date",
            convert: true
        }
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const surat_cuti = req.file;
    if(!surat_cuti){
        return res.status(400).json({success: "false", messages: "Surat Cuti cannot be empty"});
    }

    const leave = await Leave.create({
        user_id: req.body.user_id,
        tipe_cuti: req.body.tipe_cuti,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        surat_cuti: surat_cuti.filename
    });

    res.json({success: "true", messages: "Your application for leave is success", data: leave}); 
});


module.exports = router;