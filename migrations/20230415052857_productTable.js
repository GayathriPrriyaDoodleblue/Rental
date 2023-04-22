exports.up = function (knex) {
    return knex.schema.createTable('productTable', function (table) {
        table.increments('id').primary();
        table.string('productName');
        table.string('productDescription');
        table.integer('productPrice');
        table.boolean('isForSale').defaultTo(true);
        table.boolean('isForRent').defaultTo(false);
        table.integer('brandId').unsigned().references('id').inTable('brandTable');
        table.integer('categoryId').unsigned().references('id').inTable('categoryTable');
        table.integer('ownerId').unsigned().references('id').inTable('infoTable');
        table.integer('editedBy').unsigned().references('id').inTable('infoTable');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('productTable');
};