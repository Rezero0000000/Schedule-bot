"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const db_1 = require("./database/db");
async function connectToWhatsApp() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)("auth");
    const registrationState = {};
    const sock = (0, baileys_1.default)({
        printQRInTerminal: true,
        auth: state
    });
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !==
                baileys_1.DisconnectReason.loggedOut;
            console.log("connection closed due to ", lastDisconnect?.error, ", reconnecting ", shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        }
        else if (connection === "open") {
            console.log("opened connection");
        }
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (msg.key.fromMe) {
            console.log(msg.message?.conversation);
            const jid = msg.key.remoteJid;
            const message = msg.message?.conversation?.toLowerCase();
            //   if (msg.message && msg.message.locationMessage) {
            //     const location = msg.message.locationMessage
            //     console.log('Received location message:', {
            //         latitude: location.degreesLatitude,
            //         longitude: location.degreesLongitude,
            //         name: location.name || 'No name',
            //         address: location.address || 'No address'
            //     })
            // }
            if (!message)
                return;
            while (true) {
                if (!registrationState[jid]) {
                    if (message === "daftar") {
                        registrationState[jid] = true;
                        await sock.sendMessage(jid, { text: "Welcome! Please input your details in the following format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
                    }
                    break;
                }
                else {
                    const registrationPattern = /^name:\s*[a-zA-Z\s]+\s*\nprodi:\s*[a-zA-Z\s]+\s*\nnim:\s*\d+\s*\npassword:\s*\S+$/i;
                    if (registrationPattern.test(message)) {
                        const [name, prodi, nim, password] = message.split('\n').map(item => item.split(':')[1].trim());
                        const user = {
                            name,
                            prodi,
                            nim,
                            password,
                            isLogin: false
                        };
                        await (0, db_1.db)('users').insert(user);
                        console.log(user);
                        await sock.sendMessage(jid, { text: `Thank you, ${name}! Your registration details:\nNIM: ${nim}\nProdi: ${prodi}\nYou are now registered.` });
                        registrationState[jid] = false;
                    }
                    else {
                        await sock.sendMessage(jid, { text: "Invalid format. Please enter your details in the correct format:\nname: [your name]\nprodi: [your program]\nnim: [your NIM]\npassword: [your password]" });
                    }
                    break;
                }
            }
            if (message == "/jadwal") {
                const data = await (0, db_1.db)("schedule").select("*");
                console.log(data);
                let scheduleString = "";
                const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                for (const day of days) {
                    console.log(day);
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
                await sock.sendMessage(jid, { text: scheduleString });
            }
        }
    });
}
connectToWhatsApp();
