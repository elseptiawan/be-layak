var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const multer = require('multer');

const { Reimbursement } = require('../models');
const v = new Validator();

const multerDiskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Storages/Reimbursements');
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
    const reimbursement = await Reimbursement.findAll({
        include: ["user"]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: reimbursement}); 
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const reimbursement = await Reimbursement.findByPk(id, {
        include: ["user"]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: reimbursement || {}});
});

router.post('/', multerUpload.single('bukti_pembayaran'), async (req, res) => {
    const schema = {
        jumlah_uang: 'string',
        tanggal_pembayaran: {
            type: "date",
            convert: true
        },
        kebutuhan: 'string'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const bukti_pembayaran = req.file;
    if(!bukti_pembayaran){
        return res.status(400).json({success: "false", messages: "Surat Cuti cannot be empty"});
    }

    const reimbursement = await Reimbursement.create({
        user_id: req.body.user_id,
        jumlah_uang: parseInt(req.body.jumlah_uang),
        tanggal_pembayaran: req.body.tanggal_pembayaran,
        bukti_pembayaran: bukti_pembayaran.filename,
        kebutuhan: req.body.kebutuhan
    });

    res.json({success: "true", messages: "Your application for reimbursement is success", data: reimbursement}); 
});

module.exports = router;