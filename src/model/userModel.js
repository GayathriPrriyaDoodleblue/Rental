const { Model } = require('objection');

class userModel extends Model {
  static get tableName() {
    return 'userTable';
  }
}

module.exports = userModel