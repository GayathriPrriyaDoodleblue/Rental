const Joi = require('joi');
const status = require('../validate/status')

const joiRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
        role: Joi.string().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ message: error.details[0].message });
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
        return res.status(status.badRequest).json({ message: error.details[0].message });
    }
    next();
};

const joiQuery = (req, res, next) => {
    const schema = Joi.object({
        search: Joi.string().optional(),
        id: Joi.number().optional(),
        categoryName: Joi.string().optional(),
        brandName: Joi.string().optional(),
        productName: Joi.string().optional(),
        limit: Joi.number().integer().positive().optional(),
        page: Joi.number().integer().positive().optional(),
        userId: Joi.number().optional(),
        orderDate: Joi.date().optional(),
        name: Joi.string().optional(),
        productId:Joi.number().integer().positive().optional(),
        email: Joi.string().optional(),
        status:Joi.string().optional(),
        sortBy:Joi.string().optional(),
        ownerName:Joi.string().optional(),
        renterName:Joi.string().optional(),
        lenderName:Joi.string().optional(),
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

const joiBody = (req, res, next) => {
    const schema = Joi.object({
        categoryName: Joi.string().optional(),
        brandName: Joi.string().optional(),
        categoryId: Joi.number().optional(),
        productName: Joi.string().optional(),
        productDescription: Joi.string().optional(),
        productPrice: Joi.number().optional(),
        brandId: Joi.number().optional(),
        isForSale: Joi.boolean().optional(),
        isForRent: Joi.boolean().optional(),
        ownerId: Joi.number().optional(),
        productId: Joi.number().optional(),
        userId: Joi.number().optional(),
        quantity: Joi.number().optional(),
        rentStart: Joi.date().optional(),
        rentEnd: Joi.date().optional(),
        status:Joi.string().optional(),
        name: Joi.string().optional(),
        password:Joi.string().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ error: error.details[0].message });
    }
    next();
};

module.exports = {
    joiQuery,
    joiBody,
    joiRegister,
    joiLogin
}