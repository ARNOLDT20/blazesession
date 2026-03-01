const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
// load baileys dynamically since it's an ESM module
let makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers;

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    const startTime = Date.now();

    async function BLAZE_MD_PAIR_CODE() {
        if (!makeWASocket) {
            const baileys = await import('@whiskeysockets/baileys');
            makeWASocket = baileys.makeWASocket;
            useMultiFileAuthState = baileys.useMultiFileAuthState;
            delay = baileys.delay;
            makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
            Browsers = baileys.Browsers;
        }
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const items = ["Safari", "Chrome", "Firefox"];
            const randomItem = items[Math.floor(Math.random() * items.length)];

            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS(randomItem),
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                const latency = Date.now() - startTime;
                const performanceLevel = latency < 200 ? "🟢 Excellent" : latency < 500 ? "🟡 Good" : "🔴 Slow";

                try {
                    if (qr) return await res.end(await QRCode.toBuffer(qr));

                    if (connection == "open") {
                        await delay(3000);
                        let rf = __dirname + `/temp/${id}/creds.json`;

                        function generateBLAZE_ID() {
                            const prefix = "BLAZE";
                            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                            let blazeID = prefix;
                            for (let i = prefix.length; i < 22; i++) {
                                blazeID += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            return blazeID;
                        }

                        const blazeID = generateBLAZE_ID();

                        try {
                            const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                            const string_session = mega_url.replace('https://mega.nz/file/', '');
                            let session_code = "blaze~" + string_session;

                            let code = await sock.sendMessage(sock.user.id, { text: session_code });

                            let text = `┏━❑ *BLAZE-MD SESSION* ✅\n` +
`┏━❑ *SAFETY RULES* ━━━━━━━━━\n` +
`┃ 🔹 *Session ID:* Sent above.\n` +
`┃ 🔹 *Warning:* Do not share this code!.\n` +
`┃ 🔹 Keep this code safe.\n` +
`┃ 🔹 Valid for 24 hours only.\n` +
`┗━━━━━━━━━━━━━━━\n` +
`┏━❑ *CHANNEL* ━━━━━━━━━\n` +
`┃ 📢 Follow our channel: https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02\n` +
`┗━━━━━━━━━━━━━━━\n` +
`┏━❑ *REPOSITORY* ━━━━━━━━━\n` +
`┃ 💻 Repository: https://github.com/Sila-Md/SILA-MD\n` +
`┃ 👉 Fork & contribute!\n` +
`┗━━━━━━━━━━━━━━━\n\n` +
`╔► 𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞 𝐋𝐞𝐯𝐞𝐥:\n╠► ${performanceLevel}\n╚► → 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐭𝐢𝐦𝐞: ${latency}ms\n\n` +
`> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐁𝐋𝐀𝐙𝐄 𝐓𝐞𝐜𝐡`;

                            await sock.sendMessage(sock.user.id, {
                                text: text,
                                contextInfo: {
                                    externalAdReply: {
                                        title: 'BLAZE MD',
                                        body: '© BLAZE Tech',
                                        thumbnailUrl: 'https://files.catbox.moe/36vahk.png',
                                        thumbnailWidth: 64,
                                        thumbnailHeight: 64,
                                        sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                        mediaUrl: 'https://files.catbox.moe/36vahk.png',
                                        showAdAttribution: true,
                                        renderLargerThumbnail: false,
                                        previewType: 'PHOTO',
                                        mediaType: 1
                                    },
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363402325089913@newsletter',
                                        newsletterName: '© BLAZE Tech',
                                        serverMessageId: Math.floor(Math.random() * 1000000)
                                    },
                                    isForwarded: true,
                                    forwardingScore: 999
                                }
                            }, { quoted: code });

                        } catch (e) {
                            let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });

                            let textErr = `┏━❑ *BLAZE-MD SESSION* ⚠️\n` +
`┏━❑ *SAFETY RULES* ━━━━━━━━━\n` +
`┃ 🔹 *Session ID:* Sent above.\n` +
`┃ 🔹 *Warning:* Do not share this code!.\n` +
`┃ 🔹 Keep this code safe.\n` +
`┃ 🔹 Valid for 24 hours only.\n` +
`┗━━━━━━━━━━━━━━━\n\n` +
`> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐁𝐋𝐀𝐙𝐄 𝐓𝐞𝐜𝐡`;

                            await sock.sendMessage(sock.user.id, {
                                text: textErr,
                                contextInfo: {
                                    externalAdReply: {
                                        title: 'BLAZE MD',
                                        body: '© BLAZE Tech',
                                        thumbnailUrl: 'https://files.catbox.moe/36vahk.png',
                                        thumbnailWidth: 64,
                                        thumbnailHeight: 64,
                                        sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                        mediaUrl: 'https://files.catbox.moe/36vahk.png',
                                        showAdAttribution: true,
                                        renderLargerThumbnail: false,
                                        previewType: 'PHOTO',
                                        mediaType: 1
                                    },
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363402325089913@newsletter',
                                        newsletterName: '© BLAZE Tech',
                                        serverMessageId: Math.floor(Math.random() * 1000000)
                                    },
                                    isForwarded: true,
                                    forwardingScore: 999
                                }
                            }, { quoted: ddd });
                        }

                        await delay(10);
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        console.log(`👤 ${sock.user.id} 🔥 BLAZE-MD Session Connected ✅`);
                        await delay(10);
                        process.exit();
                    }
                } catch (err) {
                    console.log("⚠️ Error in connection.update:", err);
                }

                if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    BLAZE_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("⚠️ BLAZE-MD Connection failed — Restarting service...", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ BLAZE-MD Service Unavailable" });
            }
        }
    }

    await BLAZE_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("🔄 BLAZE-MD Restarting process...");
    process.exit();
}, 1800000); // 30 minutes

module.exports = router;
const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
// load baileys dynamically since it's an ESM module
let makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers;

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    const startTime = Date.now();

    async function BAZE_MD_PAIR_CODE() {
        // ensure baileys lib is imported
        if (!makeWASocket) {
            const baileys = await import('@whiskeysockets/baileys');
            // gifted-baileys exports functions as named exports rather than default
            makeWASocket = baileys.makeWASocket;
            useMultiFileAuthState = baileys.useMultiFileAuthState;
            delay = baileys.delay;
            makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
            Browsers = baileys.Browsers;
        }
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const items = ["Safari", "Chrome", "Firefox"];
            const randomItem = items[Math.floor(Math.random() * items.length)];

            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS(randomItem),
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                const latency = Date.now() - startTime;
                const performanceLevel = latency < 200 ? "🟢 Excellent" : latency < 500 ? "🟡 Good" : "🔴 Slow";

                try {
                    // send QR code if available
                    if (qr) return await res.end(await QRCode.toBuffer(qr));

                    if (connection == "open") {
                        await delay(3000);
                        let rf = __dirname + `/temp/${id}/creds.json`;

                        function generateBAZE_ID() {
                            const prefix = "BLAZE";
                            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                            let bazeID = prefix;
                            for (let i = prefix.length; i < 22; i++) {
                                bazeID += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            return bazeID;
                        }

                        const bazeID = generateBAZE_ID();

                        // ==== Upload session & send message ====
                        try {
                            const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                            const string_session = mega_url.replace('https://mega.nz/file/', '');
                            let session_code = "BAZE~" + string_session;

                            // send session code first
                            let code = await sock.sendMessage(sock.user.id, { text: session_code });

                            // send styled message with BOX
                            let text = `┏━❑ *BAZE-MD SESSION* ✅
┏━❑ *SAFETY RULES* ━━━━━━━━━
┃ 🔹 *Session ID:* Sent above.
┃ 🔹 *Warning:* Do not share this code!.
┃ 🔹 Keep this code safe.
┃ 🔹 Valid for 24 hours only.
┗━━━━━━━━━━━━━━━
┏━❑ *CHANNEL* ━━━━━━━━━
┃ 📢 Follow our channel: https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02
┗━━━━━━━━━━━━━━━
┏━❑ *REPOSITORY* ━━━━━━━━━
┃ 💻 Repository: https://github.com/Sila-Md/SILA-MD
┃ 👉 Fork & contribute!
┗━━━━━━━━━━━━━━━

╔► 𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞 𝐋𝐞𝐯𝐞𝐥:
╠► ${performanceLevel}
╚► → 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐭𝐢𝐦𝐞: ${latency}ms

> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐁𝐀𝐙𝐄 𝐓𝐞𝐜𝐡`;

                            await sock.sendMessage(sock.user.id, {
                                text: desc,
                                contextInfo: {
                                    externalAdReply: {
                                        title: 'BAZE MD',
                                            body: '© BAZE Tech',
                                        thumbnailUrl: 'https://files.catbox.moe/36vahk.png',
                                        thumbnailWidth: 64,
                                        thumbnailHeight: 64,
                                        sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                        mediaUrl: 'https://files.catbox.moe/36vahk.png',
                                        showAdAttribution: true,
                                        renderLargerThumbnail: false,
                                        previewType: 'PHOTO',
                                        mediaType: 1
                                    },
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363402325089913@newsletter',
                                        newsletterName: '© BAZE Tech',
                                        serverMessageId: Math.floor(Math.random() * 1000000)
                                    },
                                    isForwarded: true,
                                    forwardingScore: 999
                                }
                            }, { quoted: code });

                        } catch (e) {
                            let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });

                            let text = `┏━❑ *BAZE-MD SESSION* ⚠️
┏━❑ *SAFETY RULES* ━━━━━━━━━
┃ 🔹 *Session ID:* Sent above.
┃ 🔹 *Warning:* Do not share this code!.
┃ 🔹 Keep this code safe.
┃ 🔹 Valid for 24 hours only.
┗━━━━━━━━━━━━━━━
┏━❑ *CHANNEL* ━━━━━━━━━
┃ 📢 Follow our channel: https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02
┗━━━━━━━━━━━━━━━
┏━❑ *REPOSITORY* ━━━━━━━━━
┃ 💻 Repository: https://github.com/Sila-Md/SILA-MD
┃ 👉 Fork & contribute!
┗━━━━━━━━━━━━━━━

╔► 𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞 𝐋𝐞𝐯𝐞𝐥:
╠► ${performanceLevel}
╚► → 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐭𝐢𝐦𝐞: ${latency}ms

> © 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐁𝐀𝐙𝐄 𝐓𝐞𝐜𝐡`;

                            await sock.sendMessage(sock.user.id, {
                                text: desc,
                                contextInfo: {
                                    externalAdReply: {
                                        title: 'SILA MD',
                                        body: '© Sila Tech',
                                        thumbnailUrl: 'https://files.catbox.moe/36vahk.png',
                                        thumbnailWidth: 64,
                                        thumbnailHeight: 64,
                                        sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                        mediaUrl: 'https://files.catbox.moe/36vahk.png',
                                        showAdAttribution: true,
                                        renderLargerThumbnail: false,
                                        previewType: 'PHOTO',
                                        mediaType: 1
                                    },
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: '120363402325089913@newsletter',
                                        newsletterName: '© Sila Tech',
                                        serverMessageId: Math.floor(Math.random() * 1000000)
                                    },
                                    isForwarded: true,
                                    forwardingScore: 999
                                }
                            }, { quoted: ddd });
                        }

                        await delay(10);
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        console.log(`👤 ${sock.user.id} 🔥 BAZE-MD Session Connected ✅`);
                        await delay(10);
                        process.exit();
                    }
                } catch (err) {
                    console.log("⚠️ Error in connection.update:", err);
                }

                if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    BAZE_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("⚠️ BAZE-MD Connection failed — Restarting service...", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ BAZE-MD Service Unavailable" });
            }
        }
    }

    await BAZE_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("🔄 SILA-MD Restarting process...");
    process.exit();
}, 1800000); // 30 minutes

module.exports = router;
