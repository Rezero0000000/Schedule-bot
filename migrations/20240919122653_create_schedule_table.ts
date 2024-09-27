import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('schedule', function(table) {
        table.increments('id').primary();
        table.string('day').notNullable();
        table.string('course').notNullable();
        table.string('lecturer').notNullable();
        table.string('room_number').notNullable();
        table.time('start_time').notNullable();
        table.time('end_time').notNullable();
        table.integer('credits').notNullable();
        
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('schedule');
}

