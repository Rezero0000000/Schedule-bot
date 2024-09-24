import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { db } from "./database/db";
import { Services } from "./services/services";

const cron = require('node-cron');
const moment = require('moment-timezone');

// Notification

async function sendScheduledNotification(sock) {
  cron.schedule('* * * * *', async () => {
    const now = moment().tz('Asia/Jakarta').format('HH:mm');
    const oneHourLater = moment().tz('Asia/Jakarta').add(1, 'hour').format('HH:mm');
    const today = moment().tz('Asia/Jakarta').format('dddd');

    const schedules = await db('schedule')
      .where('hari', today)
      .andWhere('jam_mulai', oneHourLater); 

    if (schedules.length > 0) {
      const users = await db('users').where('isLogin', true);

      for (let schedule of schedules) {
        const message = `Pelajaran ${schedule.mata_kuliah} dengan dosen ${schedule.dosen} akan dimulai pada pukul ${schedule.jam_mulai} di ruangan ${schedule.no_ruangan}. Jangan lupa bersiap!`;

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

// Count the distance
const haversine = (lat1, lon1, lat2, lon2) => {
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


async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const registrationState: { [key: string]: boolean } = {};

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state
  });
  
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect?.error,
        ", reconnecting ",
        shouldReconnect
      );
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
      sendScheduledNotification(sock);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (msg.key.fromMe) {
        console.log(msg.message?.conversation)
        const jid = msg.key.remoteJid;
        const message = msg.message?.conversation?.toLowerCase();
        const user = await db("users").where("jid", jid).first();

        if (msg.message && msg.message.locationMessage && user.isLogin) {
        const location = msg.message.locationMessage;
  
        const referenceLocation = {
          latitude: 0.5334638, 
          longitude: 101.4401185, 
          radius: 7 
        };
        
        const distance = haversine(
          referenceLocation.latitude,
          referenceLocation.longitude,
          location.degreesLatitude,
          location.degreesLongitude
        );
      
        console.log(`Jarak pengguna: ${distance} meter`);
        console.log('Received location:', {
          latitude: location.degreesLatitude,
          longitude: location.degreesLongitude
        });
        
        await sock.sendMessage(jid, { text: message });
        if (distance <= referenceLocation.radius) { 
          await sock.sendMessage(jid, { text: "Absen berhasil! Anda berada dalam radius 7 meter." });
        } else {
          await sock.sendMessage(jid, { text: `Anda berada di luar radius. Jarak: ${distance.toFixed(2)} meter.` });
        }
    
      }
        if (!message) return;
        
        if (message == "/status"){
          if (user.isLogin){
            await sock.sendMessage(jid, {text: "Sudah login"});
            return
          }
            await sock.sendMessage(jid, {text: "Belum login"});
        }

        if (!user.isLogin) {
         
            if (!registrationState[jid]) {
              if (message === "daftar") {
                registrationState[jid] = true;
                await sock.sendMessage(jid, { text: "Welcome! Please input your details in the following format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
              } 
              // else if (!user.isLogin && message !== "/login") {
              //   await sock.sendMessage(jid, { text: "Please register first." });
              // }
            } else {
              const registrationPattern = /^name:\s*[a-zA-Z\s]+\s*\nprodi:\s*[a-zA-Z\s]+\s*\nnim:\s*\d+\s*\npassword:\s*\S+$/i;
              
              if (registrationPattern.test(message)) {
                const [name, prodi, nim, password] = message.split('\n').map(item => item.split(':')[1].trim());
    
                const user = {
                  name,
                  prodi,
                  nim,
                  jid,
                  password,
                  isLogin: false
                };
    
                await db('users').insert(user);
                await sock.sendMessage(jid, { text: `Thank you, ${name}! Your registration details:\nNIM: ${nim}\nProdi: ${prodi}\nYou are now registered.` });
                registrationState[jid] = false; 
                
              } else {
              
                await sock.sendMessage(jid, { text: "Invalid format. Please enter your details in the correct format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
              }
            } 
            // Login
            if (message.startsWith("/login")) {
              const parts = message.split(" ");
              if (parts.length === 2) {
                const password = parts[1];
                if (user.password == password){
                  await db("users").where("jid", jid).update({
                    isLogin: true
                  });
                }
                else {
                  await sock.sendMessage(jid, {text: "Wrong password"});
                }
              } else {
                await sock.sendMessage(jid, { text: "Invalid format. Please use: /login [password]" });
              }
            }
        } else {
          if (message == "/jadwal") {
              const scheduleString = await Services.getSchedule();
              await sock.sendMessage(jid, { text: scheduleString });
            }
          }

          if (message == "/logout") {
            await db("users").where("jid", jid).update({
              isLogin: false
            });
            await sock.sendMessage(jid, {text: "Logout berhasil"});
          }
      }
  });
}
connectToWhatsApp();