import { db } from "../database/db";

export class Services {
    public static async getSchedule () {
        const data = await db("schedule").select("*");
          console.log(data)

          let scheduleString = "";
          const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          
          for (const day of days) {
            console.log(day)
            const daySchedule = data.filter(item => item.hari === day);
            
            if (daySchedule.length > 0) {
              scheduleString += `*${day}*\n\n`;
              
              daySchedule.forEach((course, index) => {
                scheduleString += `- **Matkul ${index + 1}:** ${course.mata_kuliah}\n`;
                scheduleString += `  - Dosen: ${course.dosen}\n`;
                scheduleString += `  - No Ruangan: ${course.no_ruangan}\n`;
                scheduleString += `  - Jam: ${course.jam_mulai} - ${course.jam_selesai}\n`;
                scheduleString += `  - SKS: ${course.sks} SKS\n\n`;
              });
              
              scheduleString += "\n";
            }
          }
          return scheduleString;
    }
}