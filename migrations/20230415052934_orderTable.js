exports.up = function (knex) {
    return knex.schema.createTable('orderTable', function (table) {
        table.increments('id').primary();
        table.integer('userId').unsigned().references('id').inTable('infoTable');
        table.string('role');
        table.integer('productId').unsigned().references('id').inTable('productTable');
        table.integer('productPrice');
        table.integer('quantity');
        table.string('orderType');
        table.integer('totalCost');
        table.date('orderDate');
        table.integer('perDay');
        table.date('rentStart');
        table.date('rentEnd');
        table.integer('totalDays');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderTable');
};