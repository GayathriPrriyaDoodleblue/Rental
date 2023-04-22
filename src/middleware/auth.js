const jwt = require('jsonwebtoken');
const status = require('../validations/status');
const infoModel = require('../models/infoModel');

const generateToken = (user) => {
    const tokenPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '2h' });
    return { token };
};

const authenticate = (roles) => async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authorization header missing or invalid');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;
        if (decoded.role === 'admin' && roles.includes('admin')) {
            user = await infoModel.query().where('id', decoded.id).andWhere('role', 'admin').first();
        } else if (decoded.role === 'lender' && roles.includes('lender')) {
            user = await infoModel.query().where('id', decoded.id).andWhere('role', 'lender').first();
        } else if (decoded.role === 'renter' && roles.includes('renter')) {
            user = await infoModel.query().where('id', decoded.id).andWhere('role', 'renter').first();
        } else {
            throw new Error('Invalid user role');
        }

        if (!user) {
            throw new Error('Unauthorized');
        }

        req.user = {
            id: user.id,
            ...user,
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(status.unauthorized).json({ error: error.message });
    }
};

module.exports = {
    generateToken,
    authenticate
};
