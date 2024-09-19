"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    // create table
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('prodi').notNullable();
        table.string('nim').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').notNullable().defaultTo('user');
        table.boolean('isLogin').notNullable();
        table.timestamps(true, true);
    });
}
async function down(knex) {
    /// drop table
    await knex.schema.dropTable('users');
}
