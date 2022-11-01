var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const { verifyToken, checkUser } = require('../middleware/authJWT.js');
const multer = require('multer');

const { User, Company, Presence, Leave, Reimbursement } = require('../models');

const v = new Validator();
const { Op } = require("sequelize");

const multerDiskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Storages/Bukti-Reimburse');
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

router.get('*', checkUser);
router.post('*', checkUser);
router.put('*', checkUser);
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

router.get('/leaves', verifyToken, async (req, res) => {
    const admin = await User.findByPk(req.id);
    const leaves = await Leave.findAll({
        where: {
            '$user.company_id$': admin.company_id,
            status: 'Pending'
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: leaves});
});

router.get('/leaves/history', verifyToken, async (req, res) => {
    const admin = await User.findByPk(req.id);
    const leaves = await Leave.findAll({
        where: {
            '$user.company_id$': admin.company_id,
            status: {
                [Op.or]: ['Approved', 'Declined']
            }
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: leaves});
});

router.put('/leaves/:id', verifyToken, async (req, res) => {
    const schema = {
        status: 'string',
        alasan_ditolak: 'string|optional'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    var leave = await Leave.findByPk(req.params.id);

    leave = leave.update({
        status: req.body.status
    });

    if(req.body.alasan_ditolak){
        await Leave.update({
            alasan_ditolak: req.body.alasan_ditolak
        },
        {
            where:{
                id: req.params.id
            }
        });
    }

    res.json({success: "true", messages: "leave application " + req.body.status});
});

router.get('/reimbursement', verifyToken, async (req, res) => {
    const admin = await User.findByPk(req.id);
    const reimbursements = await Reimbursement.findAll({
        where: {
            '$user.company_id$': admin.company_id,
            status: 'Pending'
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: reimbursements});
});

router.get('/reimbursement/history', verifyToken, async (req, res) => {
    const admin = await User.findByPk(req.id);
    const reimbursements = await Reimbursement.findAll({
        where: {
            '$user.company_id$': admin.company_id,
            status: {
                [Op.or]: ['Approved', 'Declined']
            }
        },
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: reimbursements});
});

router.put('/reimbursement/:id', verifyToken, multerUpload.single('bukti_reimburse'), async (req, res) => {
    const schema = {
        status: 'string',
        alasan_ditolak: 'string|optional'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    var reimbursement = await Reimbursement.findByPk(req.params.id);

    reimbursement = reimbursement.update({
        status: req.body.status
    });

    const bukti_reimburse = req.file;
    if(bukti_reimburse){
        await Reimbursement.update({
            bukti_reimburse: bukti_reimburse.filename
        },{
            where: {
                id: req.params.id
            }
        }
        );
    }

    if(req.body.alasan_ditolak){
        await Reimbursement.update({
            alasan_ditolak: req.body.alasan_ditolak
        },{
            where: {
                id: req.params.id
            }
        }
        );
    }

    res.json({success: "true", messages: "leave application " + req.body.status});
});

router.get('/users', verifyToken, async (req, res) => {
    const admin = await User.findByPk(req.id);
    const users = await User.findAll({
        where: {
            company_id: admin.company_id,
            role: 'User'
        },
        attributes: {
            exclude: ['password']
        }
    });

    res.json({success: "true", messages: "Data retrieved successfully", data: users})
});

router.post('/users', verifyToken, async (req, res) => {
    const schema = {
        nama: 'string',
        email: 'string',
        position: 'string',
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const admin = await User.findByPk(req.id);

    const company = await Company.findOne({id: admin.company_id});

    const user = await User.create({
        nama: req.body.nama,
        email: req.body.email,
        password: bcrypt.hashSync('defaultpassword', salt),
        position: req.body.position,
        role: "User",
        sisa_cuti: company.jatah_cuti,
        company_id: admin.company_id
    });

    res.json({success: "true", messages: "The account has been updated", data: user});
  });

router.put('/users/:id', verifyToken, async (req, res) => {
    const schema = {
        nama: 'string',
        email: 'string',
        position: 'string',
        sisa_cuti: 'number'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    var user = await User.findByPk(req.params.id);

    user = user.update({
        nama: req.body.nama,
        email: req.body.email,
        position: req.body.position,
        sisa_cuti: req.body.sisa_cuti
    });

    res.json({success: "true", messages: "The account has been created"});
  });

router.delete('/users/:id', verifyToken, async (req, res) => {
    await User.destroy({
        where: {
            id: req.params.id
        }
    })

    res.json({success: "true", messages: "The account has been deleted"})
});

module.exports = router;