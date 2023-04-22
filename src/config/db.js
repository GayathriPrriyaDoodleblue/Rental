const knex = require('knex')(require('../../knexfile'));

const { Model } = require('objection');

knex
    .raw("select 1+1 as result")
    .then(_ => {
        console.log(' Database Connected Successfully')
    })
    .catch(e => {
        console.log(e)
        process.exit(1)
    })
Model.knex(knex)

module.exports = knex;


exports.up = function (knex) {
    return knex.schema.createTable('categorytable', function (table) {
        table.increments('id').primary();
        table.string('categoryName');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('categorytable');
};

exports.up = function (knex) {
    return knex.schema.createTable('brandtable', function (table) {
        table.increments('id').primary();
        table.string('brandName');
        table.integer('categoryId').unsigned().references('id').inTable('categorytable');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('brandtable');
};

exports.up = function (knex) {
    return knex.schema.createTable('producttable', function (table) {
        table.increments('id').primary();
        table.string('productName');
        table.string('productDescription');
        table.integer('productPrice');
        table.integer('brandId').unsigned().references('id').inTable('brandTable');
        table.integer('categoryId').unsigned().references('id').inTable('categoryTable');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('producttable');
};

exports.up = function (knex) {
    return knex.schema.createTable('orderTable', function (table) {
        table.increments('id').primary();
        table.integer('productId').unsigned().references('id').inTable('productTable');
        table.integer('userId').unsigned().references('id').inTable('userTable');
        table.date('orderDate');
        table.integer('quantity');
        table.integer('orderPrice');
        table.string('role');
        table.date('rentStart');
        table.date('rentEnd');
        table.integer('perDay');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderTable');
};

