var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const { verifyToken, checkUser } = require('../middleware/authJWT.js');
const multer = require('multer');

const { User, Company, Presence, Leave, Reimbursement } = require('../models');

const v = new Validator({
    messages: {
        unique: "The email is already exist"
    }
});

const { Op } = require("sequelize");

const multerDiskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Storages/Bukti-Reimburse');
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const nameArr = originalName.split('.');
        var extension = '';
        if (nameArr.length > 1) {
            extension = nameArr[nameArr.length - 1];
        }

        cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
});

const multerDiskStorageLeave = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Storages/Template-Surat-Cuti');
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const nameArr = originalName.split('.');
        var extension = '';
        if (nameArr.length > 1) {
            extension = nameArr[nameArr.length - 1];
        }

        cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
});

const multerUpload = multer({ storage: multerDiskStorage });
const multerUploadLeave = multer({ storage: multerDiskStorageLeave });

router.get('*', checkUser);
router.post('*', checkUser);
router.put('*', checkUser);
router.delete('*', checkUser);

router.get('/presences', verifyToken, async (req, res) => {
    var nowDate = new Date();
    var date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
    const user = await User.findByPk(req.id);

    if (user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var options = {
        createdAt: {
            [Op.lt]: new Date(),
            [Op.gt]: date
        },
        clock_in: {
            [Op.ne]: null
        }
    }

    if (req.query.search){
        options = {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            },
            clock_in: {
                [Op.ne]: null
            },
            [Op.or] : {
                '$user.nama$': {
                    [Op.like] : '%' + req.query.search + '%'
                },
                '$user.position$' : {
                    [Op.like] : '%' + req.query.search + '%'
                }
            }
        }
    }
    
    const presences = await Presence.findAll({
        where: options,
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            },
            where: {
                company_id: user.company_id
            }
        }
    })

    res.json({ success: "true", messages: "Data retrieved successfully", data: presences })
});

router.get('/presences/yet', verifyToken, async (req, res) => {
    var nowDate = new Date();
    var date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
    const admin = await User.findByPk(req.id);

    if (admin.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    const checkpresences = await Presence.findAll({
        where: {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            },
            '$user.company_id$': admin.company_id
        },
        include: ['user']
    });

    const user = await User.findAll({
        where: {
            company_id: admin.company_id,
            role: 'User'
        },
        attributes: {
            exclude: ['password']
        }
    });

    if (Object.keys(checkpresences).length === 0) {
        user.forEach(async function (entry) {
            await Presence.create({
                user_id: entry.id
            });
        });
    }

    else {
        var user_id = [];
        checkpresences.forEach(function (en) {
            user_id.push(en.user_id);
        });
        user.forEach(async function (ent) {
            if (user_id.includes(ent.id)) {
                return;
            }
            const createpresence = await Presence.create({
                user_id: ent.id
            });
        });
    }

    var options = {
        createdAt: {
            [Op.lt]: new Date(),
            [Op.gt]: date
        },
        '$user.company_id$': admin.company_id,
        clock_in: null
    }

    if (req.query.search){
        options = {
            createdAt: {
                [Op.lt]: new Date(),
                [Op.gt]: date
            },
            '$user.company_id$': admin.company_id,
            clock_in: null,
            [Op.or] : {
                '$user.nama$': {
                    [Op.like] : '%' + req.query.search + '%'
                },
                '$user.position$' : {
                    [Op.like] : '%' + req.query.search + '%'
                }
            }
        }
    }

    const presences = await Presence.findAll({
        where: options,
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    // presences = { ...presences, ...getpresences };
    // // presences.push(...getpresences)

    res.json({ success: "true", messages: "Data retrieved successfully", data: presences })
});

router.get('/presences/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    if (user.role != 'Admin') {
        return res.json({ success: "false", messages: "You Don't have access" })
    }
    const presence = await Presence.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    if(!presence){
        return res.status(400).json({success: "false", messages: "Data Not Found"})
    }

    if (presence.user.company_id != user.company_id) {
        return res.json({ success: "false", messages: "You Don't have access to other company employee" })
    }

    res.json({ success: "true", messages: "Data retrieved successfully", data: presence });
});

router.get('/leaves', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var options = {
        '$user.company_id$': user.company_id,
        status: 'Pending'
    };

    if (req.query.search){
        options = {
            '$user.company_id$': user.company_id,
            status: 'Pending',
            [Op.or] : {
                '$user.nama$' : {
                    [Op. like] : '%' + req.query.search + '%'
                },
                '$user.position$': {
                    [Op. like] : '%' + req.query.search + '%'
                }
            }
        }
    }

    const leaves = await Leave.findAll({
        where : options,
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        },
        order: [['id', 'DESC']]
    });

    res.json({ success: "true", messages: "Data retrieved successfully", data: leaves });
});

router.get('/leaves/history', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var options = {
        '$user.company_id$': user.company_id,
        status: {
            [Op.or]: ['Approved', 'Declined']
        }
    };

    if (req.query.search){
        if(req.query.status){
            options = {
                '$user.company_id$': user.company_id,
                status: req.query.status,
                [Op.or] : {
                    '$user.nama$' : {
                        [Op. like] : '%' + req.query.search + '%'
                    },
                    '$user.position$': {
                        [Op. like] : '%' + req.query.search + '%'
                    }
                }
            }
        }
        else {
            options = {
                '$user.company_id$': user.company_id,
                status: {
                    [Op.or]: ['Approved', 'Declined']
                },
                [Op.or] : {
                    '$user.nama$' : {
                        [Op. like] : '%' + req.query.search + '%'
                    },
                    '$user.position$': {
                        [Op. like] : '%' + req.query.search + '%'
                    }
                }
            }
        }
    }

    else if (req.query.status){
        options = {
            '$user.company_id$': user.company_id,
            status: req.query.status
        }
    }

    const leaves = await Leave.findAll({
        where: options,
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        },
        order: [['id', 'DESC']]
    });

    res.json({ success: "true", messages: "Data retrieved successfully", data: leaves });
});

router.get('/leaves/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Admin') {
        return res.json({ success: "false", messages: "You Don't have access" })
    }

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

    if (leave.user.company_id != user.company_id) {
        return res.json({ success: "false", messages: "You Don't have access to other company employee" })
    }

    res.json({ success: "true", messages: "Data retrieved successfully", data: leave });
});

router.put('/leaves/upload-template-surat-cuti', verifyToken, multerUploadLeave.single('template_surat_cuti'), async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    const template_surat_cuti = req.file;
    if(!template_surat_cuti){
        return res.status(400).json({success: "false", messages: "Template Surat Cuti cannot be empty"});
    }

    var company = await Company.findOne({
        where: {
            id: user.company_id
        }
    });

    company = company.update({
        template_surat_cuti: template_surat_cuti.destination + '/' + template_surat_cuti.filename
    });

    res.json ({success: "true", message: "Template Surat Cuti Has Been Uploaded"});
});

router.put('/leaves/:id', verifyToken, async (req, res) => {
    const schema = {
        status: 'string|empty:false',
        alasan_ditolak: 'string|optional'
    }

    const validate = v.validate(req.body, schema);

    if (validate.length) {
        return res.status(400).json(validate);
    }

    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var leave = await Leave.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    var start_date = new Date(leave.start_date);
    var end_date = new Date(leave.end_date);

    if (leave.user.id == user.id) {
        return res.json({ success: "false", messages: "You Can't Approve/Decline Your Own Request" });
    }

    if (leave.user.company_id != user.company_id) {
        return res.json({ success: "false", messages: "You Don't have access to other company employee" });
    }

    if (req.body.status == 'Approved'){
        if(leave.tipe_cuti != 'Hamil/melahirkan'){
            var days = end_date - start_date;
            days = days / (1000 * 3600 * 24);
            days = days + 1;
            var employee = await User.findByPk(leave.user_id);
            const sisa_cuti = employee.sisa_cuti - days;
            employee.update({
                sisa_cuti: sisa_cuti
            })
        }
    }

    leave.update({
        status: req.body.status
    });

    if (req.body.alasan_ditolak) {
        await Leave.update({
            alasan_ditolak: req.body.alasan_ditolak
        },
            {
                where: {
                    id: req.params.id
                }
            });
    }

    res.json({ success: "true", messages: "leave application " + req.body.status });
});

router.get('/reimbursement', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var options = {
        '$user.company_id$': user.company_id,
        status: 'Pending'
    };

    if (req.query.search){
        options = {
            '$user.company_id$': user.company_id,
            status: 'Pending',
            [Op.or] : {
                '$user.nama$' : {
                    [Op. like] : '%' + req.query.search + '%'
                },
                '$user.position$': {
                    [Op. like] : '%' + req.query.search + '%'
                }
            }
        }
    }

    const reimbursements = await Reimbursement.findAll({
        where: options,
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        },
        order: [['id', 'DESC']]
    });

    res.json({ success: "true", messages: "Data retrieved successfully", data: reimbursements });
});

router.get('/reimbursement/history', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var options = {
        '$user.company_id$': user.company_id,
        status: {
            [Op.or] : ['Approved', 'Declined']
        }
    };

    if (req.query.search){
        if(req.query.status){
            options = {
                '$user.company_id$': user.company_id,
                status: req.query.status,
                [Op.or] : {
                    '$user.nama$' : {
                        [Op. like] : '%' + req.query.search + '%'
                    },
                    '$user.position$': {
                        [Op. like] : '%' + req.query.search + '%'
                    }
                }
            } 
        }
        else{
            options = {
                '$user.company_id$': user.company_id,
                status: {
                    [Op.or] : ['Approved', 'Declined']
                },
                [Op.or] : {
                    '$user.nama$' : {
                        [Op. like] : '%' + req.query.search + '%'
                    },
                    '$user.position$': {
                        [Op. like] : '%' + req.query.search + '%'
                    }
                }
            }
        }
    }

    else if(req.query.status){
        options = {
            '$user.company_id$': user.company_id,
            status: req.query.status
        }
    }

    const reimbursements = await Reimbursement.findAll({
        where: options,
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        },
        order: [['id', 'DESC']]
    });

    res.json({ success: "true", messages: "Data retrieved successfully", data: reimbursements });
});

router.get('/reimbursement/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Admin') {
        return res.json({ success: "false", messages: "You Don't have access" })
    }

    const reimbursement = await Reimbursement.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    if(!reimbursement){
        return res.json({success: "false", messages: "Data Not Found"})
    }

    if (reimbursement.user.company_id != user.company_id) {
        return res.json({ success: "false", messages: "You Don't have access to other company employee" })
    }

    res.json({ success: "true", messages: "Data retrieved successfully", data: reimbursement });
});

router.put('/reimbursement/:id', verifyToken, multerUpload.single('bukti_reimburse'), async (req, res) => {
    const schema = {
        status: 'string|empty:false',
        alasan_ditolak: 'string|optional'
    }

    const validate = v.validate(req.body, schema);

    if (validate.length) {
        return res.status(400).json(validate);
    }

    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var reimbursement = await Reimbursement.findByPk(req.params.id, {
        include: {
            model: User,
            as: 'user',
            attributes: {
                exclude: ['password']
            }
        }
    });

    if (reimbursement.user.id == user.id) {
        return res.json({ success: "false", messages: "You Can't Approve/Decline Your Own Request" });
    }

    if (reimbursement.user.company_id != user.company_id) {
        return res.json({ success: "false", messages: "You Don't have access to other company employee" });
    }

    reimbursement = reimbursement.update({
        status: req.body.status
    });

    const bukti_reimburse = req.file;
    if (bukti_reimburse) {
        await Reimbursement.update({
            bukti_reimburse: bukti_reimburse.destination + '/' + bukti_reimburse.filename
        }, {
            where: {
                id: req.params.id
            }
        }
        );
    }

    if (req.body.alasan_ditolak) {
        await Reimbursement.update({
            alasan_ditolak: req.body.alasan_ditolak
        }, {
            where: {
                id: req.params.id
            }
        }
        );
    }

    res.json({ success: "true", messages: "Reimburse application " + req.body.status });
});

router.get('/users', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    var options = {
        company_id: user.company_id,
        role: 'User'
    };

    if (req.query.search){
        options = {
            company_id: user.company_id,
            role: 'User',
            [Op.or] : {
                nama: {
                    [Op. like] : '%' + req.query.search + '%'
                },
                position: {
                    [Op. like] : '%' + req.query.search + '%'
                }
            }
        }
    }

    const users = await User.findAll({
        where: options,
        attributes: {
            exclude: ['password']
        }
    });

    res.json({ success: "true", messages: "Data retrieved successfully", data: users })
});

router.post('/users', verifyToken, async (req, res) => {
    const schema = {
        nama: 'string|empty:false',
        email: 'email',
        position: 'string|empty:false',
    }

    const validate = v.validate(req.body, schema);

    if (validate.length) {
        return res.status(400).json(validate);
    }

    const checkEmail = await User.findOne({
        where: {
            email: req.body.email
        }
    });

    if(checkEmail){
        return res.status(400).json([{type: 'uniqueEmail', message: 'Email already taken', field: 'email', actual: req.body.email}]);
    }

    const admin = await User.findByPk(req.id);

    if(admin.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    const company = await Company.findOne({ id: admin.company_id });

    const user = await User.create({
        nama: req.body.nama,
        email: req.body.email,
        password: bcrypt.hashSync('defaultpassword', salt),
        position: req.body.position,
        role: "User",
        sisa_cuti: company.jatah_cuti,
        company_id: admin.company_id
    });

    res.json({ success: "true", messages: "The account has been created", data: user });
});

router.put('/users/:id', verifyToken, async (req, res) => {
    const admin = await User.findByPk(req.id);

    if(admin.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    const schema = {
        nama: 'string|empty:false',
        email: 'email',
        position: 'string|empty:false',
        sisa_cuti: 'number|min:1'
    }

    const validate = v.validate(req.body, schema);

    if (validate.length) {
        return res.status(400).json(validate);
    }

    var user = await User.findByPk(req.params.id);

    user = user.update({
        nama: req.body.nama,
        email: req.body.email,
        position: req.body.position,
        sisa_cuti: req.body.sisa_cuti
    });

    res.json({ success: "true", messages: "The account has been created" });
});

router.delete('/users/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Don't Have Access"});
    }

    await User.destroy({
        where: {
            id: req.params.id
        }
    })

    res.json({ success: "true", messages: "The account has been deleted" })
});

module.exports = router;