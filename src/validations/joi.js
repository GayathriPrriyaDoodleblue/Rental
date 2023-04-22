const Joi = require('joi');
const status = require('../validations/status');

const joiRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
        role: Joi.string().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};

const joiLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
        role: Joi.string().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};


const joiBody=(req,res,next) => {
    const schema = Joi.object({
        name: Joi.string().optional(),
        password:Joi.string().optional(),
        status:Joi.string().optional(),
        brandName:Joi.string().optional(),
        categoryName:Joi.string().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};

const joiQuery = (req, res, next) => {
    const schema = Joi.object({
        limit: Joi.number().integer().positive().optional(),
        page: Joi.number().integer().positive().optional(),
        id:Joi.number().integer().positive().optional(),
        productId:Joi.number().integer().positive().optional(),
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        status:Joi.string().optional(),
        sortBy:Joi.string().valid('asc','desc').optional(),
        ownerName:Joi.string().optional(),
        renterName:Joi.string().optional(),
        lenderName:Joi.string().optional(),
        productName:Joi.string().optional(),
        orderType:Joi.string().optional(),
        positionA:Joi.number().integer().optional(),
        positionB:Joi.number().integer().optional(),

    });
    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};
module.exports = { joiRegister, joiLogin, joiBody,joiQuery}