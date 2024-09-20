import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { db } from "./database/db";
import { Services } from "./services/services";
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
        
        if (!message) return;
        
        // Register
        if (!user.isLogin) {
         
          // Authentication
            if (!registrationState[jid]) {
              if (message === "daftar") {
                registrationState[jid] = true;
                await sock.sendMessage(jid, { text: "Welcome! Please input your details in the following format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
              } else if (!user.isLogin && message !== "/login") {
                await sock.sendMessage(jid, { text: "Please register first." });
              }
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
        }
  });
}
connectToWhatsApp();

































// Location
      //   if (msg.message && msg.message.locationMessage) {
      //     const location = msg.message.locationMessage
          
      //     console.log('Received location message:', {
      //         latitude: location.degreesLatitude,
      //         longitude: location.degreesLongitude,
      //         name: location.name || 'No name',
      //         address: location.address || 'No address'
      //     })
      // }
