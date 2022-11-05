var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

const { User, Company } = require('../models');

const v = new Validator();

router.post('/createSuperAdmin', async (req, res) => {
    const schema = {
        nama: 'string',
        email: 'string',
        position: 'string',
        company_id: 'number'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    const company = await Company.findOne({id: req.body.company_id});

    const user = await User.create({
        nama: req.body.nama,
        email: req.body.email,
        password: bcrypt.hashSync('defaultpassword', salt),
        position: req.body.position,
        role: "Super Admin",
        sisa_cuti: company.jatah_cuti,
        company_id: req.body.company_id
    });

    res.json({success: "true", messages: "The account has been created", data: user});
  });

module.exports = router;