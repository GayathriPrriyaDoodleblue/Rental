const dbConfig = require('../config/db');
dbConfig();

module.exports = {
    brand: require('./brandModel'),
    category: require('./categoryModel'),
    product: require('./productModel'),
};