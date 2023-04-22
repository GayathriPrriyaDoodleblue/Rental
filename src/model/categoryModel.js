const { Model } = require('objection');

class categoryModel extends Model {
  static get tableName() {
    return 'categoryTable';
  }
}

module.exports = categoryModel;
