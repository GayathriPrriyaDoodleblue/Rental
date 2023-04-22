const { Model } = require('objection');

class infoTable extends Model {
  static get tableName() {
    return 'infoTable';
  }
}

module.exports = infoTable