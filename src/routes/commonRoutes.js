const router = require('express').Router();
const lenderController = require('../controller/lenderController');
const { authenticate } = require('../middleware/auth');
const { joiQuery, joiBody, joiLogin, joiRegister } = require('../validate/joi')

router.post('/register', joiRegister, lenderController.create);

router.post('/login', joiLogin, lenderController.login);

router.post('/uploadCategory', lenderController.uploadCategory);

router.post('/uploadBrand', lenderController.uploadBrand);

router.post('/uploadProduct', lenderController.uploadProduct);

router.post('/createCategory',authenticate(['admin','lender', 'renter']), joiBody, lenderController.createCategory);

router.post('/createBrand', authenticate(['lender', 'renter']), joiBody, lenderController.createBrand);

router.post('/createProduct', authenticate(['lender', 'renter']), joiBody, lenderController.createProduct);

router.get('/getCategory', authenticate(['lender', 'renter']), joiQuery, lenderController.getCategory);

router.get('/getBrand', authenticate(['lender', 'renter']), joiQuery, lenderController.getBrand);

router.get('/getproduct', authenticate(['lender', 'renter']), joiQuery, lenderController.getProduct);

router.put('/edit/:id', authenticate(['lender', 'renter']), joiBody, lenderController.editProduct);

router.post('/sale', authenticate(['lender', 'renter']), joiBody, lenderController.createSale);

router.post('/rent', authenticate(['lender', 'renter']), joiBody, lenderController.createRent);

router.delete('/deleteOrder/:id',authenticate(['admin','lender', 'renter']),lenderController.deleteOrder);

router.get('/getRent', authenticate(['lender', 'renter']), joiQuery, lenderController.getRent);

router.get('/getSale', authenticate(['lender', 'renter']), joiQuery, lenderController.getSale);

router.get('/myrentals', authenticate(['lender', 'renter']), joiQuery, lenderController.getMyRentals);

router.get('/myclosets', authenticate(['lender', 'renter']), joiQuery, lenderController.getMyCloset);

router.get('/searchAll', authenticate(['lender', 'renter']), joiQuery, lenderController.searchAll);

router.get('/allusers', authenticate(['lender', 'renter']), joiQuery, lenderController.getAllUsers);

router.get('/users', authenticate(['lender', 'renter']), joiQuery, lenderController.getUsers);

router.get('/orders', authenticate(['lender', 'renter']), joiQuery, lenderController.getOrders);

router.get('/searchItemManagement',authenticate(['admin']),lenderController.searchItemManagement);

router.get('/searchOrderManagement',authenticate(['admin']), lenderController.searchOrderManagement);

router.get('/getItemsById/:id',authenticate(['admin']),lenderController.getItemsById);

router.put("/editItems/:id",authenticate(['admin']), lenderController.editItems);

router.get('/getOrdersById/:id',authenticate(['admin']),lenderController.getOrdersById);

router.get('/masterData',authenticate(['admin']),lenderController.masterData);

router.delete('/deleteProduct/:id',authenticate(['admin']),lenderController.deleteProduct);

module.exports = router;
