import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
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


export async function down(knex: Knex): Promise<void> {
    /// drop table
    await knex.schema.dropTable('users');
}

