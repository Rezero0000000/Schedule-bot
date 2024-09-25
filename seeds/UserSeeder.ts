import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("users").del();

    await knex("users").insert([
        {
            name: "atomic",
            prodi: "Teknik Informatika",
            nim: "1234567890",
            jid: "6287741174222@s.whatsapp.net",
            password: "admin",
            role: "admin",
            isLogin: false,
        },
    ]);
};
