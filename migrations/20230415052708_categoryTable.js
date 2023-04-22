exports.up = function (knex) {
    return knex.schema.createTable('categoryTable', function (table) {
        table.increments('id').primary();
        table.string('categoryName');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('categoryTable');
};