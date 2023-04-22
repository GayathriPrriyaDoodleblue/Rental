const lenderService = require('../service/lenderService');
const { logger } = require('../winston/logger');
const STATUS = require('../validate/status')
const message = require('../validate/message')
function LenderController() { }

LenderController.prototype.create = async function (req, res) {
    const { name, email, password, role } = req.body;

    if (role !== 'lender' && role !== 'renter' && role !== 'admin') {
        return res.status(STATUS.badRequest).json({ status: message.false, error: message.role });
    }

    try {
        const lender = await lenderService.create(name, email, password, role);
        logger.info('user created', { lender });
        res.status(STATUS.success).json({ status: message.true, data: lender });

    } catch (error) {
        logger.error('unable to create', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.login = async function (req, res) {
    const { email, password, role } = req.body;

    try {
        const lender = await lenderService.login(email, password, role);
        if (!lender) {
            return res.status(STATUS.badRequest).json({ status: message.false, error: message.incorrect });
        }
        logger.info('user login successfully', { lender });
        res.status(STATUS.success).json({ status: message.true, data: lender });

    } catch (error) {
        logger.error('unable to login', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.createCategory = async function (req, res) {
    try {
        const { categoryName } = req.body;

        const { category, error } = await lenderService.createCategory({ categoryName });
        if (error) {
            return res.status(STATUS.badRequest).json({ status: message.false, error: error });
        }

        logger.info('category created', { category });
        res.status(STATUS.success).json({ status: message.true, data: category });

    } catch (error) {
        console.log(error);
        logger.error('unable to create', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.createBrand = async function (req, res) {
    try {
        const { brandName, categoryId } = req.body;

        const brand = await lenderService.createBrand({ brandName, categoryId });
        logger.info('brand created successfully', { brand });
        res.status(STATUS.success).json({ status: message.true, data: brand });

    } catch (error) {
        console.log(error);
        logger.error('unable to create', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.createProduct = async function (req, res) {
    try {
        const { productName, productDescription, productPrice, categoryId, brandId, isForSale, isForRent } = req.body;

        const product = await lenderService.createProduct({
            productName,
            productDescription,
            productPrice,
            categoryId,
            brandId,
            isForSale,
            isForRent,
            ownerId: req.user.id
        });
        logger.info('product created successfully', { product });
        res.status(STATUS.success).json({ status: message.true, data: product });

    } catch (error) {
        console.log(error);
        logger.error('unable to create', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getCategory = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, categoryName } = req.query;

        const category = await lenderService.getCategory(limit, page, id, categoryName);
        if (!category || category.length === 0) {
            return res.status(status.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, data: category });
        }
        logger.info('product fetched successfully', { category });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getBrand = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, brandName } = req.query;

        const brand = await lenderService.getBrand(limit, page, id, brandName);
        if (!brand || brand.length === 0) {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, data: brand });
        }
        logger.info('brand fetched successfully', { brand });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getProduct = async function (req, res) {
    try {
        console.log("bodys ------>", req.query)
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, productName } = req.query;

        const product = await lenderService.getProduct(limit, page, id, productName);
        if (!product || product.length === 0) {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, data: product });
        }
        logger.info('product fetched successfully', { product });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.editProduct = async function (req, res) {
    try {

        const { id } = req.params;

        const { productName, productDescription, productPrice, isForSale, isForRent, brandId, categoryId, ownerId } = req.body;

        const product = await lenderService.editProduct(id, {
            productName,
            productDescription,
            productPrice,
            isForSale,
            isForRent,
            brandId,
            categoryId,
            ownerId,
            editedBy: req.user.id
        });

        if (!product) {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, data: product });
        }
        logger.info('product fetched successfully', { product });

    } catch (error) {
        console.error(error);
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.createSale = async function (req, res) {
    try {
        const { productId, quantity } = req.body;

        const { userSale, error } = await lenderService.createSale({
            productId,
            quantity,
            userId: req.user.id
        });

        if (error) {
            return res.status(STATUS.success).json({ status: message.false, error });
        }

        logger.info('purchased successfully', { userSale });
        res.status(STATUS.success).json({ status: message.true, data: userSale });

    } catch (error) {
        console.error(error);
        logger.error('unable to purchase', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.createRent = async function (req, res) {
    try {
        const { productId, quantity, rentStart, rentEnd } = req.body;

        const { userRent, error } = await lenderService.createRent({
            productId,
            quantity,
            rentStart,
            rentEnd,
            userId: req.user.id
        });

        if (error) {
            return res.status(STATUS.success).json({ status: message.false, error });
        }

        logger.info('Rent created successfully', { userRent });
        res.status(STATUS.success).json({ status: message.true, data: userRent });

    } catch (error) {
        console.error(error);
        logger.error('Unable to create rent', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.deleteOrder = async function (req, res) {
    try {
        const { id } = req.params;

        const { deletedRows, error } = await lenderService.deleteOrder(id);
        if (error) {
            logger.error('order not found');
            return res.status(STATUS.badRequest).json({ status: message.false, error: error, data: null });
        }
        if (!deletedRows || deletedRows.error) {
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound });
        }

        logger.info('order deleted successfully', { deletedRows });
        return res.status(STATUS.success).json({ status: message.true, message: message.deleted, data: deletedRows });

    } catch (error) {
        console.error(error);
        logger.error('Unable to delete', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getRent = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, userId, orderDate } = req.query;

        const rental = await lenderService.getRent(limit, page, id, userId, orderDate);
        if (!rental || rental.length === 0) {
            res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, data: rental });
        }
        logger.info('rental fetched', { rental });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getSale = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, userId, orderDate } = req.query;

        const lender = await lenderService.getSale(limit, page, id, userId, orderDate);
        if (!lender || lender.length === 0) {
            res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, data: lender });
        }
        logger.info('lender fetched', { lender });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getMyRentals = async function (req, res) {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const { id, userId, orderDate } = req.query;
    try {
        const myRentals = await lenderService.getMyRentals(limit, page, id, userId, orderDate);
        if (!myRentals || myRentals.length === 0) {
            res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            const rentalsWithStatus = myRentals.map(rental => {
                const currentDate = new Date();
                const rentEnd = new Date(rental.rentEnd);
                if (rentEnd < currentDate) {
                    rental.status = 'Completed';
                } else if (rental.rentStart <= currentDate && rentEnd >= currentDate) {
                    rental.status = 'Current';
                } else {
                    rental.status = 'Upcoming';
                }
                return rental;
            });
            res.status(STATUS.success).json({ status: message.true, myRentals: rentalsWithStatus });
        }
        logger.info('myRentals fetched', { myRentals });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getMyCloset = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const { id, userId, orderDate } = req.query;

        const myCloset = await lenderService.getMyCloset(limit, page, id, userId, orderDate);
        if (!myCloset || myCloset.length === 0) {
            res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            res.status(STATUS.success).json({ status: message.true, myCloset: myCloset });
        }
        logger.info('myCloset fetched', { myCloset });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getAllUsers = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const users = await lenderService.getAllUsers(limit, page);

        if (!users || users.length === 0) {
            return res.status(STATUS.success).json({ status: message.true, error: message.records, data: [] });
        } else {
            logger.info('user fetched', { users });
            res.status(STATUS.success).json({ status: message.true, data: users });
        }

    } catch (error) {
        console.error(error);
        logger.info('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getUsers = async function (req, res) {
    try {
        console.log("body ------>", req.query)
        const { id, name } = req.query;
        const users = await lenderService.getUsers(id, name);
        if (!users || users.length === 0) {
            res.status(STATUS.success).json({ status: message.false, message: message.notFound });
        } else {
            logger.info('user fetched', { users });
            return res.status(STATUS.success).json({ status: message.true, data: users });
        }

    } catch (error) {
        console.error(error);
        logger.info('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.getOrders = async function (req, res) {
    try {
        console.log("body ------>", req.query)
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, userId, orderDate } = req.query;

        const orders = await lenderService.getOrders(limit, page, id, userId, orderDate);
        if (!orders || orders.length === 0) {
            res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound, data: null });
        } else {
            return res.status(STATUS.success).json({ status: message.true, data: orders });
        }
        logger.info('orders fetched', { orders });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.uploadCategory = async function (req, res) {
    try {
        const result = await lenderService.uploadCategory(req.files.file);
        logger.info('uploaded', { result });
        res.status(STATUS.success).json({ status: message.true, data: result });

    } catch (error) {
        console.error(error);
        logger.info('not uploaded', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.uploadBrand = async function (req, res) {
    try {
        const result = await lenderService.uploadBrand(req.files.file);
        logger.info('uploaded', { result });
        res.status(STATUS.success).json({ status: message.true, data: result });

    } catch (error) {
        console.error(error);
        logger.info('not uploaded', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.uploadProduct = async function (req, res) {
    try {
        const result = await lenderService.uploadProduct(req.files.file);
        logger.info('uploaded', { result });
        res.status(STATUS.success).json({ status: message.true, data: result });

    } catch (error) {
        console.error(error);
        logger.info('not uploaded', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};

LenderController.prototype.searchAll = async function (req, res) {
    try {
        const search = req.query.search;
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const productName = req.query.productName;
        const categoryName = req.query.categoryName;
        const brandName = req.query.brandName;

        const productList = await lenderService.searchAll(search, limit, page, productName, categoryName, brandName);

        if (Object.keys(productList).length === 0) {
            res.status(STATUS.success).json({ status: message.false, message: message.notFound, data: [] });
        } else if (page > productList.totalPages) {
            res.status(STATUS.badRequest).json({ status: message.false, message: `Invalid page number. Total pages: ${productList.totalPages}`, data: [] });
        } else {
            const categories = Object.entries(productList.categories).map(([category, products]) => {
                return { category, products };
            });

            res.status(STATUS.success).json({ status: message.true, totalItems: productList.totalItems, data: { categories }, count: productList.count, totalPages: productList.totalPages, currentPage: productList.currentPage });
        }
        logger.info('fetched successfully', { productList });

    } catch (error) {
        console.error(error);
        logger.error('unable to fetch', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};
LenderController.prototype.searchItemManagement = async function (req, res) {
    try {
        const { id, ownerName, sortBy, page, limit } = req.query;
        const result = await lenderService.searchItemManagement(id, ownerName, sortBy, page, limit);
        const { items, totalItems, totalPages, currentPage } = result;
        if (!items || items.length === 0) {
            logger.error('Data not found')
            return res.status(STATUS.success).json({ status: message.true, message: message.Not_Found, data: [], totalItems, totalPages, currentPage: parseInt(currentPage) });
        } else {
            logger.info('Data fetched successfully', items)
            return res.status(STATUS.success).json({ status: message.true, data: items, totalItems, totalPages, currentPage: parseInt(currentPage) });
        }
    } catch (error) {
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: message.false, message: message.Unable_To_fetch_users, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
    }
};

LenderController.prototype.getItemsById = async function (req, res) {
    try {
        const { id } = req.params;
        const { items, error } = await lenderService.getItemsById(id);

        if (error) {
            logger.error('Product not found');
            return res.status(STATUS.badRequest).json({ status: message.false, error: error, data: null });
        }
        if (!items || items.length === 0) {
            logger.error('Product not found');
            return res.status(STATUS.notFound).json({ status: message.false, message: message.Not_Found, data: null });
        }
        else {
            logger.info('Data fetched successfully', items)
            return res.status(STATUS.success).json({ status: message.true, data: items });
        }
    } catch (error) {
        console.error(error);
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: message.false, message: message.Unable_To_fetch_users });
    }

};


LenderController.prototype.searchOrderManagement = async function (req, res) {
    try {
        const { id, renterName, lenderName, productId, productName, orderType, sortBy, page, limit } = req.query;
        const result = await lenderService.searchOrderManagement(id, renterName, lenderName, productId, productName, orderType, sortBy, page, limit);
        const { orders, totalItems, totalPages, currentPage } = result;
        if (!orders || orders.length === 0) {
            logger.error('Data not found')
            return res.status(STATUS.success).json({ status: message.true, message: message.Not_Found, data: [], totalItems, totalPages, currentPage: parseInt(currentPage) });
        } else {
            logger.info('Data fetched successfully', orders)
            return res.status(STATUS.success).json({ status: message.true, data: orders, totalItems, totalPages, currentPage: parseInt(currentPage) });
        }
    } catch (error) {
        console.error(error);
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: message.false, message: message.Unable_To_fetch_users, data: [], totalItems: 0, totalPages: 0, currentPage: 0 });
    }
};
LenderController.prototype.editItems = async function (req, res) {
    const { id } = req.params;
    const { brandName, categoryName } = req.body;

    try {
        const { item, error } = await lenderService.editItems(id, brandName, categoryName);

        if (error) {
            logger.error('Product not found');
            return res.status(STATUS.badRequest).json({ status: message.false, error: error, data: null });
        }
        if (!item) {
            logger.error('Item not found', { error });
            return res.status(STATUS.success).json({ status: message.false, message: message.Not_Found, data: null });
        }

        logger.info('Item edited successfully', { item });
        return res.status(STATUS.success).json({ status: message.true, data: item });
    } catch (error) {
        logger.error('Unable to update item', { error })
        return res.status(STATUS.internalServerError).json({ status: message.false, message: message.Unable_To_Update_Items, error: error.message });
    }
};
LenderController.prototype.deleteProduct = async function (req, res) {
    try {
        const { id } = req.params;
        const { deletedRows, error } = await lenderService.deleteProduct(id);
        if (error) {
            logger.error('Product not found');
            return res.status(STATUS.badRequest).json({ status: message.false, error: error, data: null });
        }
        if (!deletedRows || deletedRows.error) {
            logger.error('product not found', { error });
            return res.status(STATUS.badRequest).json({ status: message.false, message: message.notFound });
        }
        logger.info('product deleted successfully', { deletedRows });
        return res.status(STATUS.success).json({ status: message.true, message: message.deleted, data: deletedRows });

    } catch (error) {
        console.error(error);
        logger.error('Unable to delete', { error });
        return res.status(STATUS.internalServerError).json({ status: message.false, error: message.internalServerError });
    }
};
LenderController.prototype.getOrdersById = async function (req, res) {
    try {
        const { id } = req.params;
        const { order, error } = await lenderService.getOrdersById(id);
        if (error) {
            logger.error('Data not found')
            return res.status(STATUS.badRequest).json({ status: message.false, error: error, data: null });
        }
        if (!order || order.length === 0) {
            logger.error('Data not found')
            res.status(STATUS.success).json({ status: message.false, message: message.Not_Found, data: null });
        } else {
            logger.info('Data fetched successfully', order)
            return res.status(STATUS.success).json({ status: message.true, data: order });
        }
    } catch (error) {
        console.error(error);
        logger.error('Data not found', error)
        res.status(STATUS.internalServerError).json({ status: message.false, message: message.Unable_To_Fetch_Orders });
    }
};
LenderController.prototype.masterData = async function (req, res) {
    try {
        const { positionA, positionB } = req.query;
        const { updatedResponse, error } = await lenderService.masterData(positionA, positionB);
        if (error) {
            logger.error('Data not found')
            return res.status(STATUS.badRequest).json({ status: message.false, error: error, data: null });
        }
        logger.info('categories swapped successfully', updatedResponse);
        res.status(STATUS.success).json({ status: message.true, data: updatedResponse });
    } catch (error) {
        console.error(error);
        logger.error('Error', error)
        res.status(STATUS.internalServerError).json({ status: message.false, message: message.Unable_To_Swap_Categories, data: [] });
    }
};

module.exports = new LenderController();