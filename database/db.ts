import knex from 'knex';

const database = knex({
    client: "sqlite3",
    connection: {
      filename: "./database/dev.sqlite3"
    },
    useNullAsDefault : true
});

export { database as db };