const { Model } = require('objection');

class orderModel extends Model {
  static get tableName() {
    return 'orderTable';
  }
}

module.exports = orderModel