var express = require('express');
var router = express.Router();

const Validator = require('fastest-validator');
const multer = require('multer');

const { Presence } = require('../models');
const v = new Validator();

const multerDiskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Storages/Presences');
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
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    const { Op } = require("sequelize");
    const {presenceToday, created} = await Presence.findOrCreate({
        where: {
            createdAt: {[Op.like]: '%'+yyyy + '-' + mm + '-' + dd+'%'},
        },
        defaults: {
            user_id: 1,
            createdAt: Date()
        }
    });
    if(created){
        return res.send(presenceToday);
    }
    const presences = await Presence.findAll({
        include: ["user"]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: presences}); 
});

module.exports = router;