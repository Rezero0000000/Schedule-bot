import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("users").del();

    // insert 1 data for admin
    await knex("users").insert([
        {
            name: "atomic",
            prodi: "Teknik Informatika",
            nim: "1234567890",
            password: "admin",
            role: "admin",
            isLogin: false,
        },
    ]);
};
