exports.up = function (knex) {
    return knex.schema.createTable('infoTable', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.enu('role', ['admin', 'lender', 'renter']).defaultTo('admin');
        table.enu('status', ['active', 'inactive']).defaultTo('active');
        table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('infoTable');
  };