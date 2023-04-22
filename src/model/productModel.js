const { Model } = require('objection');

class productModel extends Model {
  static get tableName() {
    return 'productTable';
  }
}

module.exports = productModel