var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

const { User, Company, Presence } = require('../models');

const v = new Validator();
const { Op } = require("sequelize");

router.get('*', checkUser);
router.post('*', checkUser);
router.get('/presences', verifyToken, async (req, res) => {
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
    const admin = await User.findByPk(req.id);
    const presences = await Presence.findAll({
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
              }
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            },
            where: {
                company_id: admin.company_id
            }
        }
    })

    res.json({success: "true", messages: "Data retrieved successfully", data: presences})
});

router.get('/presences/yet', verifyToken, async (req, res) => {
    return res.send('KALEM BOS BELUM JALAN')
    var nowDate = new Date(); 
    var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
    const admin = await User.findByPk(req.id);
    const user = await User.findAll({
        where: {
            company_id: admin.company_id,
            role: 'User'
        },
        attributes: {
            exclude: ['password']
        }
    });
    const user_id = await Presence.findAll({
        attributes: ['user_id'],
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            }
        }
    });
    user.forEach(async function(entry) {
        user_id.forEach(async function(en){
            if(en == entry.id){
                return;
            }
            const test = await Presence.create({
                user_id: entry.id
            });
            return res.json(test);
        });
        if (!user_id.includes(entry.id)){
            return res.send('OK');
            // await Presence.create({
            //     user_id: entry.id
            // });
        }
    });
    return res.send('KO');
    const presences = await Presence.findAll({
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            },
            clock_in: null
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            },
            where: {
                company_id: admin.company_id
            }
        }
    })

    res.json({success: "true", messages: "Data retrieved successfully", data: presences})
});

router.post('/users', verifyToken, async (req, res) => {
    const schema = {
        nama: 'string',
        email: 'string',
        password: 'string',
        position: 'string',
        company_id: 'number',
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const company = await Company.findOne({id: req.body.company_id});

    const user = await User.create({
        nama: req.body.nama,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt),
        position: req.body.position,
        role: "User",
        sisa_cuti: company.jatah_cuti,
        company_id: req.body.company_id
    });

    res.json({success: "true", messages: "The account has been created", data: user});
  });

module.exports = router;