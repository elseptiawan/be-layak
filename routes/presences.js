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
    // var nowDate = new Date(); 
    // var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate(); 
    // return res.send(date);
    // var today = new Date();
    // var dd = String(today.getDate()).padStart(2, '0');
    // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = today.getFullYear();

    // today = yyyy + '-' + mm + '-' + dd;
    // return res.send(date);
    const { Op } = require("sequelize");
    const presenceToday = await Presence.findOrCreate({
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
              },
        },
        defaults: {
            user_id: 1,
            createdAt: Date()
        }
    });
    const presences = await Presence.findAll({
        include: ["user"]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: presences}); 
});

module.exports = router;