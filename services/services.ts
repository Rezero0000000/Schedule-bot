import { db } from "../database/db";
const cron = require('node-cron');
const moment = require('moment-timezone');

export class Services {
    public static async checkStatus (user, sock, jid) {
      if (user.isLogin){
        return await sock.sendMessage(jid, {text: "Logged in"});
      }
        return await sock.sendMessage(jid, {text: "Not logged in"});
    }

    public static async attendance (msg, jid, sock) {
        const location = msg.message.locationMessage;
        
        const referenceLocation = {
          latitude: 0.5334638, 
          longitude: 101.4401185, 
          radius: 7 
        };
        
        const distance = Services.haversine(
          referenceLocation.latitude,
          referenceLocation.longitude,
          location.degreesLatitude,
          location.degreesLongitude
        );
      
        console.log(`User distance: ${distance} meters`);
        console.log('Received location:', {
          latitude: location.degreesLatitude,
          longitude: location.degreesLongitude
        });
        
        if (distance <= referenceLocation.radius) { 
          const now = new Date();
          const options = { 
            timeZone: 'Asia/Jakarta', 
            hour: '2-digit' as const, 
            minute: '2-digit' as const, 
            hour12: false 
          };
          const time = now.toLocaleTimeString('id-ID', options);
          
          await db("attendances").insert({
            isAttend: true,
            day: now.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }), 
            time: time, 
            jid: jid
          });
          
          await sock.sendMessage(jid, { text: "Attendance successful! You are within the 7-meter radius." });
        } else {
          await sock.sendMessage(jid, { text: `You are outside the radius. Distance: ${distance.toFixed(2)} meters.` });
        }
      }        

    public static async getSchedule () {
        const data = await db("schedule").select("*");
        console.log(data)
          let scheduleString = "";
          const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          
          for (const day of days) {
            const daySchedule = data.filter(item => item.day === day);
            
            if (daySchedule.length > 0) {
              scheduleString += `*${day}*\n\n`;
              
              daySchedule.forEach((course, index) => {
                scheduleString += `- **Matkul ${index + 1}:** ${course.course}\n`;
                scheduleString += `  - Dosen: ${course.lecturer}\n`;
                scheduleString += `  - No Ruangan: ${course.room_number}\n`;
                scheduleString += `  - Jam: ${course.start_time} - ${course.end}\n`;
                scheduleString += `  - SKS: ${course.credits} SKS\n\n`;
              });
              
              scheduleString += "\n";
            }
          }
          return scheduleString;
    }

    public static async sendScheduledNotification(sock) {
      cron.schedule('* * * * *', async () => {
        const now = moment().tz('Asia/Jakarta').format('HH:mm');
        const oneHourLater = moment().tz('Asia/Jakarta').add(1, 'hour').format('HH:mm');
        const today = moment().tz('Asia/Jakarta').format('dddd');

        const schedules = await db('schedule')
          .where('day', today)
          .andWhere('start_time', oneHourLater); 

        if (schedules.length > 0) {
          const users = await db('users').where('isLogin', true);

          for (let schedule of schedules) {
            const message = `Pelajaran ${schedule.course} dengan dosen ${schedule.lecturer} akan dimulai pada pukul ${schedule.start_time} di ruangan ${schedule.room_number}. Jangan lupa bersiap!`;

            for (let user of users) {
              const jid = user.jid;
              await sock.sendMessage(jid, { text: message });
            }
          }
          console.log(`Notifikasi dikirim untuk jadwal pelajaran yang dimulai pada ${oneHourLater}`);
        }
      }, {
        timezone: 'Asia/Jakarta'
      });
    }
    
    public static  haversine  (lat1, lon1, lat2, lon2) {
      const toRad = (value) => (value * Math.PI) / 180;
    
      const R = 6371; // Radius bumi dalam kilometer
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Jarak dalam kilometer
      return distance * 1000; // Konversi ke meter
    };
}