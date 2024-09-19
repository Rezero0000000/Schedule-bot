import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('schedule', function(table) {
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


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('schedule');
}

