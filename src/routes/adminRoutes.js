const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { joiLogin, joiRegister,joiBody,joiQuery} = require('../validations/joi');
const { authenticate } = require('../middleware/auth');

router.post('/login', joiLogin, adminController.login);

router.post('/register', joiRegister, adminController.createAdmin);

router.get('/searchUserManagement',authenticate(['admin']),joiQuery, adminController.searchUserManagement);

router.get('/searchItemManagement',authenticate(['admin']),joiQuery,adminController.searchItemManagement);

router.get('/searchOrderManagement',authenticate(['admin']),joiQuery, adminController.searchOrderManagement);

router.get('/getUsersById/:id',authenticate(['admin']),adminController.getUsersById);

router.get('/getItemsById/:id',authenticate(['admin']),adminController.getItemsById);

router.get('/getOrdersById/:id',authenticate(['admin']),adminController.getOrdersById);

router.put("/editUsers/:id",authenticate(['admin']),joiBody,adminController.editUsers);

router.put("/editItems/:id",authenticate(['admin']),joiBody, adminController.editItems);

router.delete('/deleteOrder/:id',authenticate(['admin']), adminController.deleteOrder);

router.delete('/deleteProduct/:id',authenticate(['admin']), adminController.deleteProduct);

router.get('/masterData',authenticate(['admin']),joiQuery,adminController.masterData);

router.post('/createCategory',authenticate(['admin']),joiBody,adminController.createCategory);

module.exports = router;