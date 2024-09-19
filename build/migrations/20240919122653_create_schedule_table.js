"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('schedule', function (table) {
        table.increments('id').primary();
        table.string('hari').notNullable();
        table.string('mata_kuliah').notNullable();
        table.string('dosen').notNullable();
        table.string('no_ruangan').notNullable();
        table.time('jam_mulai').notNullable();
        table.time('jam_selesai').notNullable();
        table.integer('sks').notNullable();
    });
}
async function down(knex) {
    return knex.schema.dropTable('schedule');
}
