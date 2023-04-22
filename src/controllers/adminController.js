const STATUS = require('../validations/status');
const MESSAGE = require('../validations/message');
const adminService = require('../services/adminService');
const { logger } = require('../winston/logger');
const bcrypt = require('bcrypt');

function adminController() { }

adminController.prototype.createAdmin = async function (req, res) {
    try {
        const { name, email, password, role } = req.body;
        if (role !== 'lender' && role !== 'renter' && role !== 'admin') {
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, error: MESSAGE.Invalid_Role });
        }
        const { admin, error } = await adminService.createAdmin(name, email, password, role);
        if (error) {
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, error: error });
        }
        logger.info('user created', { admin });
        res.status(STATUS.success).json({ status: MESSAGE.true, data: admin });

    } catch (error) {
        logger.error('unable to create', { error });
        return res.status(STATUS.internalServerError).json({ status: MESSAGE.false, error: MESSAGE.internalServerError });
    }
};
adminController.prototype.login = async function (req, res) {
    try {
        const { email, password, role } = req.body;

        const { admin, error, token } = await adminService.login(email, password, role);

        if (role !== 'lender' && role !== 'renter' && role !== 'admin') {
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, error: MESSAGE.Invalid_Role });
        }
        if (error) {
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, error: error });
        }
        logger.info('user login successfully', { admin });
        res.status(STATUS.success).json({ status: MESSAGE.true, data: { id: admin.id, name: admin.name, email: admin.email, token } });

    } catch (error) {
        logger.error('unable to login', { error });
        return res.status(STATUS.internalServerError).json({ status: MESSAGE.false, error: MESSAGE.internalServerError });
    }
};
adminController.prototype.searchUserManagement = async function (req, res) {
    try {
        const { id, name, email, status, sortBy, page, limit } = req.query;

        const result = await adminService.searchUserManagement(id, name, email, status, sortBy, page, limit);
        const { users, totalItems, totalPages, currentPage } = result;
        if (!users || users.length === 0) {
            logger.error('Data not found');
            res.status(STATUS.success).json({ status: MESSAGE.true, message: MESSAGE.Not_Found, data: [], totalItems, totalPages, currentPage: parseInt(currentPage) });
        } else {
            logger.info('Data fetched successfully', users);
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: users, totalItems, totalPages, currentPage: parseInt(currentPage) });
        }
    } catch (error) {
        logger.error('Error fetching user data', error);
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_fetch_users, data: null });
    }
};
adminController.prototype.searchItemManagement = async function (req, res) {
    try {
        const { id, ownerName, sortBy, page, limit } = req.query;
        const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const response = await adminService.searchItemManagement(id, ownerName, sortBy, page, limit, accessToken);
        const { items, totalItems, totalPages, currentPage } = response;
        if (!items || items.length === 0) {
            logger.error('Data not found')
            return res.status(STATUS.success).json({ status: MESSAGE.true, message: MESSAGE.Not_Found, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
        } else {
            logger.info('Data fetched successfully', items)
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: items, totalItems, totalPages, currentPage: parseInt(currentPage) });
        }
    } catch (error) {
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_fetch_users, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
    }
};
adminController.prototype.searchOrderManagement = async function (req, res) {
    try {
        const { id, renterName, lenderName, productId, productName, orderType, sortBy, page, limit } = req.query;
        const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const result = await adminService.searchOrderManagement(id, renterName, lenderName, productId, productName, orderType, sortBy, page, limit, accessToken);
        const { orders, totalItems, totalPages, currentPage } = result;
        if (!orders || orders.length === 0) {
            logger.error('Data not found')
            return res.status(STATUS.success).json({ status: MESSAGE.true, message: MESSAGE.Not_Found, data: [], totalItems, totalPages, currentPage: parseInt(currentPage) });
        } else {
            logger.info('Data fetched successfully', orders)
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: orders, totalItems, totalPages, currentPage: parseInt(currentPage) });
        }
    } catch (error) {
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Fetch_Orders, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
    }
};
adminController.prototype.getUsersById = async function (req, res) {
    try {
        const { id } = req.params;
        const { user, error } = await adminService.getUsersById(id);
        if (error) {
            logger.error('Data not found')
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, error: error, data: null });
        }
        if (!user || user.length === 0) {
            logger.error('Data not found')
            res.status(STATUS.success).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        } else {
            logger.info('Data fetched successfully', user)
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: user });
        }
    } catch (error) {
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_fetch_users, data: null });
    }
};
adminController.prototype.getItemsById = async function (req, res) {
    try {
        const { id } = req.params;
        const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const items = await adminService.getItemsById(id, accessToken);

        if (!items || items.length === 0) {
            logger.error('Product not found');
            return res.status(STATUS.notFound).json({ status: MESSAGE.true, message: MESSAGE.Not_Found, data: null });
        }
        else {
            logger.info('Data fetched successfully', items)
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: items });
        }
    } catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_fetch_users, data: null });
    }
}
adminController.prototype.getOrdersById = async function (req, res) {
    try {
        const { id } = req.params;
        const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const orders = await adminService.getOrdersById(id, accessToken);
        if (!orders || orders.length === 0) {
            logger.error('Data not found')
            res.status(STATUS.success).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        } else {
            logger.info('Data fetched successfully', orders)
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: orders });
        }
    }
    catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Fetch_Orders, data: null });
    }
}
adminController.prototype.editUsers = async function (req, res) {
    const { id } = req.params;
    const { name, password, status } = req.body;
    try {
        const { users, error } = await adminService.editUsers(id, {
            name,
            password,
            status
        });
        if (error) {
            logger.error('User not found');
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, error: error, data: null });
        }
        if (!users) {
            logger.error('User not found', { error });
            return res.status(STATUS.success).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.info('User edited successfully', { users });
        return res.status(STATUS.success).json({ status: MESSAGE.true, data: users });
    } catch (error) {
        logger.error('Unable to update user', { error })
        return res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Update_users, error: error.message, data: null });
    }
};
adminController.prototype.editItems = async function (req, res) {
    const { id } = req.params;
    const { brandName, categoryName } = req.body;
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    try {
        const item = await adminService.editItems(id, brandName, categoryName, accessToken);

        if (!item) {
            logger.error('Item not found', { error });
            return res.status(STATUS.success).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        else {
            logger.info('Item edited successfully', item)
            return res.status(STATUS.success).json({ status: MESSAGE.true, data: item });
        }
    } catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Update_Items, data: null });
    }
};
adminController.prototype.deleteOrder = async function (req, res) {
    const { id } = req.params;
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    try {
        const isDeleted = await adminService.deleteOrder(id, accessToken);
        if (!isDeleted) {
            logger.error('order not found', { error });
            return res.status(STATUS.success).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.info('order deleted successfully', { isDeleted });
        return res.status(STATUS.success).json({ status: MESSAGE.true, message: MESSAGE.Successfully_deleted });

    } catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Delete_Orders, data: null });
    }
};
adminController.prototype.deleteProduct = async function (req, res) {
    const { id } = req.params;
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
    try {
        const isDeleted = await adminService.deleteProduct(id, accessToken);

        if (!isDeleted) {
            logger.error('Product not found', { error });
            return res.status(STATUS.success).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.info('Product deleted successfully', { isDeleted });
        return res.status(STATUS.success).json({ status: MESSAGE.true, message: MESSAGE.Product_deleted });

    } catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.Not_Found, data: null });
        }
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Delete_Products, data: null });
    }
};
adminController.prototype.masterData = async function (req, res) {
    try {
        const { positionA, positionB } = req.query;
        const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const updatedResponse = await adminService.masterData(positionA, positionB, accessToken);
        logger.info('categories swapped successfully', updatedResponse);
        res.status(STATUS.success).json({ status: MESSAGE.true, data: updatedResponse });
    } catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.Position_Not_Found });
        }
        logger.error('Error', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Swap_Categories, data: [] });
    }
};
adminController.prototype.createCategory = async function (req, res) {
    try {
        const { categoryName } = req.body;
        const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const category = await adminService.createCategory(categoryName, accessToken);
        logger.info('category created', { category });
        res.status(STATUS.success).json({ status: MESSAGE.true, data: category });

    } catch (error) {
        if (error.response && error.response.status === STATUS.badRequest) {
            logger.error('Bad Request Error', error);
            return res.status(STATUS.badRequest).json({ status: MESSAGE.false, message: MESSAGE.exists });
        }
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: MESSAGE.false, message: MESSAGE.Unable_To_Delete_Products, data: null });
    }
};

module.exports = new adminController();