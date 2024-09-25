import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("schedule").del();

    await knex("schedule").insert([
        // Senin
        { hari: 'Senin', mata_kuliah: 'Matematika Terapan 1', dosen: 'ISD', no_ruangan: '128', jam_mulai: '07:00', jam_selesai: '09:00', sks: 2 },
        { hari: 'Senin', mata_kuliah: 'Instrumentasi Dan Pengukuran Listrik', dosen: 'YPP', no_ruangan: '210', jam_mulai: '09:00', jam_selesai: '12:00', sks: 3 },
       
        // Selasa
        { hari: 'Selasa', mata_kuliah: 'Agama', dosen: 'EDI', no_ruangan: '120', jam_mulai: '13:00', jam_selesai: '15:00', sks: 2 },
        { hari: 'Selasa', mata_kuliah: 'Fisika Terapan', dosen: 'MYE', no_ruangan: '130', jam_mulai: '15:00', jam_selesai: '17:00', sks: 2 },
       
        // Rabu
        { hari: 'Rabu', mata_kuliah: 'Praktikum Instrumentasi', dosen: 'TNR/FHG', no_ruangan: '230', jam_mulai: '07:00', jam_selesai: '10:00', sks: 3 },
        { hari: 'Rabu', mata_kuliah: 'Rangkaian Listrik', dosen: 'RTW', no_ruangan: '304', jam_mulai: '13:00', jam_selesai: '16:00', sks: 3 },
       
        // Kamis
        { hari: 'Kamis', mata_kuliah: 'Bahasa Indonesia', dosen: 'AFL', no_ruangan: '130', jam_mulai: '07:00', jam_selesai: '09:00', sks: 2 },
        { hari: 'Kamis', mata_kuliah: 'Gambar Teknik Elektronika', dosen: 'ELS/USA', no_ruangan: '218', jam_mulai: '10:00', jam_selesai: '13:00', sks: 3 },
        
        // Jumat
        { hari: 'Jumat', mata_kuliah: 'Bahasa Inggris 1', dosen: 'MAY', no_ruangan: '129', jam_mulai: '09:00', jam_selesai: '11:00', sks: 2 },
        
        // Sabtu
        { hari: 'Sabtu', mata_kuliah: 'K3 dan etika lingkungan', dosen: 'DI K3', no_ruangan: '127', jam_mulai: '09:00', jam_selesai: '11:00', sks: 2 }
    ]);
};
