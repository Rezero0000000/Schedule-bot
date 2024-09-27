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
      Services.sendScheduledNotification(sock);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // When there is a messages
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (msg.key.fromMe) {

        const jid = msg.key.remoteJid;
        const message = msg.message?.conversation?.toLowerCase();
        const user = await db("users").where("jid", jid).first();
        console.log(`Receive a message: ${message}`);
        if (!message && !msg.message.locationMessage) return;


        if (message == "/status"){
          Services.checkStatus(user, sock, jid);
        }

        
        if (!user){
          // Register

          if (!registrationState[jid]) {
            if (message === "/register") {
              registrationState[jid] = true;
              await sock.sendMessage(jid, { text: "Welcome! Please input your details in the following format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
            } 
            else {
              await sock.sendMessage(jid, { text: "Please register first by typing '/register'." });
            } 
          } 
          
          else {
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
              
            } 
            else {
              await sock.sendMessage(jid, { text: "Invalid format. Please enter your details in the correct format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
            }
          } 

        }
        else if (!user.isLogin) {
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
              } 
              else {
                await sock.sendMessage(jid, { text: "Invalid format. Please use: /login [password]" });
              }
            } 
            else {
              await sock.sendMessage(jid, { text: "Please Sign in first by typing '/login [password]'." });
            }
        } 
        else {
            // Schedule
            if (message == "/schedule") {
              const scheduleString = await Services.getSchedule();
              await sock.sendMessage(jid, { text: scheduleString });
            }
            
            // Attedance
            if (msg.message && msg.message.locationMessage) {
              Services.attendance(msg, jid, sock);
            }
  
            // Logout
            if (message == "/logout") {
              await db("users").where("jid", jid).update({
                isLogin: false
              });
              await sock.sendMessage(jid, {text: "Logout Sucessfully"});
            }
          }
      }
  });
}
connectToWhatsApp();