exports.up = function (knex) {
    return knex.schema.createTable('brandTable', function (table) {
        table.increments('id').primary();
        table.string('brandName');
        table.integer('categoryId').unsigned().references('id').inTable('categoryTable');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('brandTable');
};