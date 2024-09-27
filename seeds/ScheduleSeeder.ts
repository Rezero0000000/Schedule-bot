import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("schedule").del();

    await knex("schedule").insert([
        // Senin
        { day: 'Senin', course: 'Matematika Terapan 1', lecturer: 'ISD', room_number: '128', start_time: '07:00', end_time: '09:00', credits: 2 },
        { day: 'Senin', course: 'Instrumentasi Dan Pengukuran Listrik', lecturer: 'YPP', room_number: '210', start_time: '09:00', end_time: '12:00', credits: 3 },
       
        // Selasa
        { day: 'Selasa', course: 'Agama', lecturer: 'EDI', room_number: '120', start_time: '13:00', end_time: '15:00', credits: 2 },
        { day: 'Selasa', course: 'Fisika Terapan', lecturer: 'MYE', room_number: '130', start_time: '15:00', end_time: '17:00', credits: 2 },
       
        // Rabu
        { day: 'Rabu', course: 'Praktikum Instrumentasi', lecturer: 'TNR/FHG', room_number: '230', start_time: '07:00', end_time: '10:00', credits: 3 },
        { day: 'Rabu', course: 'Rangkaian Listrik', lecturer: 'RTW', room_number: '304', start_time: '13:00', end_time: '16:00', credits: 3 },
       
        // Kamis
        { day: 'Kamis', course: 'Bahasa Indonesia', lecturer: 'AFL', room_number: '130', start_time: '07:00', end_time: '09:00', credits: 2 },
        { day: 'Kamis', course: 'Gambar Teknik Elektronika', lecturer: 'ELS/USA', room_number: '218', start_time: '10:00', end_time: '13:00', credits: 3 },
        
        // Jumat
        { day: 'Jumat', course: 'Bahasa Inggris 1', lecturer: 'MAY', room_number: '129', start_time: '09:00', end_time: '11:00', credits: 2 },
        
        // Sabtu
        { day: 'Sabtu', course: 'K3 dan etika lingkungan', lecturer: 'DI K3', room_number: '127', start_time: '09:00', end_time: '11:00', credits: 2 }
    ]);
};
