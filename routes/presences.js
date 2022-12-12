var express = require('express');
var router = express.Router();

const { verifyToken, checkUser } = require('../middleware/authJWT.js');
const Validator = require('fastest-validator');
const multer = require('multer');

const { Presence } = require('../models');
const v = new Validator();
const { Op } = require("sequelize");

const multerDiskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/Storages/Presences');
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
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
    const presenceToday = await Presence.findOrCreate({
        where: {
            user_id: req.id,
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
              },
        },
        defaults: {
            user_id: req.id,
            clock_in: null,
            clock_out: null,
            foto: null,
            createdAt: Date()
        }
    });
    const presences = await Presence.findAll({
        where: {
            user_id: req.id
        },
        include: ["user"],
        order: [['id', 'DESC']]
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: presences}); 
});

router.get('/today', verifyToken, async (req, res) => {
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
    const presenceToday = await Presence.findOrCreate({
        where: {
            user_id: req.id,
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
              },
        },
        defaults: {
            user_id: req.id,
            clock_in: null,
            clock_out: null,
            foto: null,
            createdAt: Date()
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: presenceToday}); 
});

router.get('/:id', verifyToken, async (req, res) => {
    const presence = await Presence.findByPk(req.params.id,{
        include: ['user']
    });

    if (!presence){
        return res.json({success: "false", messages: "Data Not Found"});
    }

    if (presence.user_id != req.id){
        return res.json({success: "true", messages: "You Don't Have Access to other user data"});
    }

    res.json({success: "true", messages: "Data retrieved successfully", data: presence});
});

router.post('/clock-in', verifyToken, multerUpload.single('foto'), async (req, res) => {
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    const foto = req.file;
    if(!foto){
        return res.status(400).json({success: "false", messages: "Foto cannot be empty"});
    }

    const presence = await Presence.update({
        clock_in: time,
        foto: 'Storages/Presences/' + foto.filename
    },
    {
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            },
            user_id: req.id
        }
    });

    res.json({success: "true", messages: "You have been clocked in succesfully, don't forget to clock out"}); 
});

router.post('/clock-out', verifyToken, async (req, res) => {
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();

    const presence = await Presence.update({
        clock_out: time
    },
    {
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            },
            user_id: {
                [Op.eq]: req.id
            }
        }
    });

    res.json({success: "true", messages: "You have been clocked out succesfully"}); 
});

module.exports = router;