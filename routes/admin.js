var express = require('express');
var router = express.Router();
const Validator = require('fastest-validator');

// const { User } = require('../models');

const v = new Validator();


router.post('/users', async (req, res) => {
    const schema = {
        email: 'string',
        password: 'string',
        position: 'string',
        foto_profil: 'string',
        company_id: 'number'
    }

    const validate = v.validate(req.body, schema);

    if(validate.length){
        return res.status(400).json(validate);
    }

    
  });

module.exports = router;