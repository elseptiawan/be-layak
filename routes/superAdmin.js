var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const { verifyToken, checkUser } = require('../middleware/authJWT.js');

const { User, Company } = require('../models');

const v = new Validator();
const { Op } = require("sequelize");

router.get('*', checkUser);
router.post('*', checkUser);
router.put('*', checkUser);
router.delete('*', checkUser);

router.get('/companies', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Super Admin'){
        return res.status(400).json({success: "false", message: "You Don't Have Access"});
    }

    const companies = await Company.findAll();

    res.json({success: "true", message: "Data retrieved successfully", data: companies})
});

router.post('/companies', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Super Admin'){
        return res.status(400).json({success: "false", message: "You Don't Have Access"});
    }

    const schema = {
        nama: 'string|min:1',
        email: 'email',
        alamat: 'string|min:1',
        web: 'string|optional',
        no_hp: 'string|min:1',
        jatah_cuti: 'number'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const company = await Company.create({
        nama: req.body.nama,
        email: req.body.email,
        alamat: req.body.alamat,
        web: req.body.web,
        jatah_cuti: req.body.jatah_cuti,
        no_hp: req.body.no_hp
    });

    res.json({success: "true", message: "Company Has Been Created", data: company})
});

router.put('/companies/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Super Admin'){
        return res.status(400).json({success: "false", message: "You Don't Have Access"});
    }

    const schema = {
        nama: 'string|min:1',
        email: 'email',
        alamat: 'string|min:1',
        web: 'string|optional',
        no_hp: 'string|min:1',
        jatah_cuti: 'number'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    var company = await Company.findByPk(req.params.id);

    if(!company){
        return res.json({success: "false", message: "Data Not Found"});
    }

    company = company.update({
        nama: req.body.nama,
        email: req.body.email,
        alamat: req.body.alamat,
        web: req.body.web,
        jatah_cuti: req.body.jatah_cuti,
        no_hp: req.body.no_hp
    });

    res.json({success: "true", message: "Company Has Been Updated", data: company})
});

router.delete('/companies/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Super Admin'){
        return res.status(400).json({success: "false", message: "You Don't Have Access"});
    }

    await Company.destroy({
        where: {
          id: req.params.id
        }
      });

    res.json({success: "true", message: "Company Has Been Deleted"})
});

router.get('/admin', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.id);

    if (user.role != 'Super Admin'){
        return res.status(400).json({success: "false", message: "You Don't Have Access"});
    }

    const admin = await User.findAll({
        where: {
            role: 'Admin'
        },
        attributes : {
            exclude: ['password']
        },
        include : ['company']
    });

    res.json({success: "true", message: "Data retrieved successfully", data: admin})
});

router.post('/admin', verifyToken, async (req, res) => {
    const schema = {
        nama: 'string|min:1',
        email: 'string|min:1',
        position: 'string|min:1',
        company_id: 'number'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const company = await Company.findByPk(req.body.company_id);
    

    const user = await User.create({
        nama: req.body.nama,
        email: req.body.email,
        password: bcrypt.hashSync('defaultpassword', salt),
        position: req.body.position,
        role: "Admin",
        sisa_cuti: company.jatah_cuti,
        company_id: req.body.company_id
    });

    res.json({success: "true", messages: "The account has been created", data: user});
});

router.put('/admin/:id', verifyToken, async (req, res) => {
    const schema = {
        nama: 'string|min:1',
        email: 'string|min:1',
        position: 'string|min:1'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }
    
    var user = await User.findByPk(req.params.id);

    if(!user){
        return res.json({success: "false", message: "Data Not Found"});
    }

    user = user.update({
        nama: req.body.nama,
        email: req.body.email,
        position: req.body.position,
    });

    res.json({success: "true", messages: "The account has been updated"});
});

router.delete('/admin/:id', verifyToken, async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if(user.role != 'Admin'){
        return res.json({success: "false", message: "You Can't Deleted Account except Admin"});
    }

    user.destroy();

    res.json({success: "true", messages: "The account has been deleted"});
});

module.exports = router;