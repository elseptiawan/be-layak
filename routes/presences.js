var express = require('express');
var router = express.Router();

const Validator = require('fastest-validator');
const multer = require('multer');

const { Presence } = require('../models');
const v = new Validator();
const { Op } = require("sequelize");

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

router.post('/clock-in', multerUpload.single('foto'), async (req, res) => {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    const foto = req.file;
    if(!foto){
        return res.status(400).json({success: "false", messages: "Foto cannot be empty"});
    }

    const presence = await Presence.update({
        clock_in: time,
        foto: foto.filename
    },
    {
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
            },
            user_id: 1
        }
    });

    res.json({success: "true", messages: "You have been clocked in succesfully, don't forget to clock out"}); 
});

router.post('/clock-out', async (req, res) => {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();

    const presence = await Presence.update({
        clock_out: time
    },
    {
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
            },
            user_id: 1
        }
    });

    res.json({success: "true", messages: "You have been clocked out succesfully"}); 
});

module.exports = router;