var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
const multer = require('multer');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

const { User } = require('../models');
const v = new Validator();

const multerDiskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Storages/Profiles');
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

router.put('*', checkUser);
router.put('/edit-password', verifyToken, async (req, res) => {
    const schema = {
        password: 'string',
        new_password: 'string',
        confirm_new_password: 'string'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    var user = await User.findByPk(req.id);

    if (!bcrypt.compareSync(req.body.password, user.password)){
        return res.status(400).json({success: "false", messages: "Password Uncorrected"})
    }

    if(req.body.new_password != req.body.confirm_new_password){
        return res.status(400).json({success: "false", messages: "Confirm New Password Uncorrected"})
    }

    user = await user.update({
        password: bcrypt.hashSync(req.body.new_password, salt)
    });

    res.json({success: "true", messages: "Your password have been changed succesfully"})
});

router.put('/edit-photo', verifyToken, multerUpload.single('foto_profil'), async (req, res) => {
    const foto_profil = req.file;
    if(!foto_profil){
        return res.status(400).json({success: "false", messages: "Foto Profil cannot be empty"});
    }

    var user = await User.findByPk(req.id);

    user = await user.update({
        foto_profil: foto_profil + '/' + foto_profil.filename
    });

    res.json({success: "true", messages: "Your photo profile have been changed succesfully"})
});

module.exports = router;