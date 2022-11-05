var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const multer = require('multer');
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

const { Leave, User } = require('../models');
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

        cb(null, file.fieldname +'-'+ Date.now() +'.'+ extension);
    }
});

const multerUpload = multer({storage: multerDiskStorage});

router.get('*', checkUser);
router.post('*', checkUser);
router.get('/', verifyToken, async (req, res) => {
    const leave = await Leave.findAll({
        where: {
            user_id: req.id
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: leave}); 
});

router.get('/download-template-surat-cuti', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id, {
        include: ['company']
    });

    res.json({success: "true", data: user});
})

router.get('/:id', verifyToken, async (req, res) => {
    const leave = await Leave.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    if(!leave){
        return res.json({success: "false", messages: "Data Not Found"})
    }

    if(leave.user.id != req.id){
        return res.json({success: "false", messages: "You Don't have access to other user data"})
    }

    res.json({success: "true", messages: "Data retrieved successfully", data: leave || {}}); 
});

router.post('/', verifyToken, multerUpload.single('surat_cuti'), async (req, res) => {
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
        deskripsi: 'string|optional'
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
        user_id: req.id,
        tipe_cuti: req.body.tipe_cuti,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        surat_cuti: surat_cuti.destination + '/' +surat_cuti.filename,
        deskripsi: req.body.deskripsi
    });

    res.json({success: "true", messages: "Your application for leave is success", data: leave}); 
});


module.exports = router;