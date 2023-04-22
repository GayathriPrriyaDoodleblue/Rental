const { Model } = require('objection');

class brandModel extends Model {
  static get tableName() {
    return 'brandTable';
  }
}

module.exports = brandModel