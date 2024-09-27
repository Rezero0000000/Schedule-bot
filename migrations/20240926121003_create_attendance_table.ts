import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('attendances', function(table) {
        table.increments('id').primary();
        table.boolean('isAttend').notNullable().defaultTo(false);
        table.string("day").notNullable()
        table.string("time").notNullable();
        table.string('jid').notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
}

