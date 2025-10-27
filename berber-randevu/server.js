require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const Twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Models
const Appointment = require('./models/Appointment');

// ---------------- Gmail Setup ----------------
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

async function sendEmail(to, subject, html) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    const result = await transporter.sendMail({
      from: `Berber App <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('✅ Email gönderildi:', result.messageId);
    return result;
  } catch (err) {
    console.error('❌ Email gönderilemedi:', err.message);
    throw err;
  }
}

// ---------------- Twilio Setup ----------------
const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ---------------- SMS Gönderme ----------------
async function sendSMS(toPhone, message) {
  try {
    const formattedPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
    
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log('✅ SMS gönderildi:', result.sid);
    return result;
  } catch (err) {
    console.error('❌ SMS gönderilemedi:', err.message);
    throw err;
  }
}

// ---------------- Admin Bildirimi ----------------
const ADMIN_EMAIL = "a.soydab083@gmail.com";
const ADMIN_PHONE = "+40771332707";
const ADMIN_SMS_PHONE = "+905466592920";

async function sendAdminNotification(appointment) {
  try {
    const adminEmailMessage = `
      <h2>🧔 YENİ RANDEVU!</h2>
      <p><strong>Müşteri:</strong> ${appointment.name}</p>
      <p><strong>Telefon:</strong> ${appointment.phone}</p>
      <p><strong>Email:</strong> ${appointment.email}</p>
      <p><strong>Randevu Tarihi:</strong> ${appointment.date.toLocaleString('tr-TR')}</p>
      <p><strong>Oluşturulma:</strong> ${new Date().toLocaleString('tr-TR')}</p>
    `;

    const adminWhatsAppMessage = `🧔 YENİ RANDEVU! 
Müşteri: ${appointment.name}
Telefon: ${appointment.phone}
Tarih: ${appointment.date.toLocaleString('tr-TR')}
Hemen ara: ${appointment.phone}`;

    const adminSMSMessage = `🧔 YENİ RANDEVU! 
Müşteri: ${appointment.name}
Tel: ${appointment.phone}
Tarih: ${appointment.date.toLocaleString('tr-TR')}`;

    await Promise.all([
      sendEmail(ADMIN_EMAIL, '🧔 Yeni Randevu!', adminEmailMessage),
      sendWhatsApp(ADMIN_PHONE, adminWhatsAppMessage),
      sendSMS(ADMIN_SMS_PHONE, adminSMSMessage)
    ]);

    console.log('📢 Admin bildirimi gönderildi (Email + WhatsApp + SMS)');
  } catch (error) {
    console.error('❌ Admin bildirimi hatası:', error);
  }
}

async function sendWhatsApp(toPhone, message) {
  try {
    const formattedPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
    const result = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedPhone}`,
      body: message
    });
    console.log('✅ WhatsApp gönderildi:', result.sid);
    return result;
  } catch (err) {
    console.error('❌ WhatsApp gönderilemedi:', err.message);
    throw err;
  }
}

// ---------------- İptal Bildirimi ----------------
async function sendCancellationNotification(appointment, reason) {
  try {
    const emailMessage = `
      <h2>❌ Randevu İptal Edildi</h2>
      <p>Merhaba <strong>${appointment.name}</strong>,</p>
      <p><strong>Randevunuz iptal edildi:</strong> ${appointment.date.toLocaleString('tr-TR')}</p>
      <p><strong>İptal Nedeni:</strong> ${reason}</p>
      <p>Yeni randevu oluşturmak için lütfen web sitemizi ziyaret edin.</p>
      <p>Anlayışınız için teşekkür ederiz. 🧔</p>
    `;

    const whatsappMessage = `Merhaba ${appointment.name}! ❌ Randevunuz iptal edildi: ${appointment.date.toLocaleString('tr-TR')}\nİptal Nedeni: ${reason}\nYeni randevu için: web sitemizi ziyaret edin.`;

    await Promise.all([
      sendEmail(appointment.email, '❌ Randevu İptal Edildi', emailMessage),
      sendWhatsApp(appointment.phone, whatsappMessage)
    ]);

    console.log('📢 İptal bildirimi gönderildi:', appointment._id);
  } catch (error) {
    console.error('❌ İptal bildirimi hatası:', error);
  }
}

// ---------------- Randevu Çakışması Kontrolü ----------------
async function checkAppointmentConflict(date, durationMinutes = 30) {
  const appointmentDate = new Date(date);
  const startTime = new Date(appointmentDate.getTime() - (durationMinutes - 1) * 60000);
  const endTime = new Date(appointmentDate.getTime() + (durationMinutes - 1) * 60000);
  
  const existingAppointment = await Appointment.findOne({
    date: { 
      $gte: startTime,
      $lte: endTime
    },
    status: { $ne: 'cancelled' }
  });
  
  return existingAppointment;
}

function getAvailableSlots(selectedDate) {
  const hours = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  return hours.join(', ');
}

// ---------------- Basit Zamanlayıcı (Agenda yerine) ----------------
const scheduledJobs = new Map();

function scheduleReminder(appointmentId, appointmentDate) {
  const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
  const now = new Date();
  
  const timeToWait = reminderTime > now ? reminderTime - now : 30000;
  
  const humanReadableTime = new Date(Date.now() + timeToWait).toLocaleString('tr-TR');
  console.log(`⏰ Bildirim planlandı: ${humanReadableTime} (${Math.round(timeToWait/1000)} saniye sonra)`);
  
  const timeoutId = setTimeout(async () => {
    try {
      console.log('🔔 Bildirim zamanı geldi!');
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.status === 'cancelled') {
        console.log('❌ Randevu bulunamadı veya iptal edilmiş');
        return;
      }

      const emailMessage = `
        <h2>Randevu Hatırlatma</h2>
        <p>Merhaba <strong>${appointment.name}</strong>,</p>
        <p><strong>Randevunuz:</strong> ${appointment.date.toLocaleString('tr-TR')}</p>
        <p><strong>Hatırlatma:</strong> Randevunuza 1 saat kaldı!</p>
        <p>Lütfen zamanında gelmeyi unutmayın. 🧔</p>
        <p><em>Not: Randevunuzu iptal etmek için lütfen bizi arayın.</em></p>
      `;

      const whatsappMessage = `Merhaba ${appointment.name}! 🧔 Randevunuz ${appointment.date.toLocaleString('tr-TR')} tarihinde, yani 1 saat sonra. Lütfen zamanında gelmeyi unutmayın!`;

      const smsMessage = `Merhaba ${appointment.name}! Randevunuz ${appointment.date.toLocaleString('tr-TR')} tarihinde. Lütfen zamanında gelmeyi unutmayın. 🧔`;

      await Promise.all([
        sendEmail(appointment.email, '🧔 Berber Randevu Hatırlatma', emailMessage),
        sendWhatsApp(appointment.phone, whatsappMessage),
        sendSMS(appointment.phone, smsMessage)
      ]);

      console.log('🎯 Bildirimler gönderildi (Email + WhatsApp + SMS):', appointmentId);
      scheduledJobs.delete(appointmentId);
      
    } catch (error) {
      console.error('❌ Bildirim hatası:', error);
    }
  }, timeToWait);

  scheduledJobs.set(appointmentId, timeoutId);
  return timeoutId;
}

// ---------------- Admin Authentication ----------------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "berber123";

// ---------------- Routes ----------------
app.get('/', (req, res) => {
  res.json({ 
    message: '🧔 Berber Randevu API - Tüm Özellikler Aktif!',
    status: 'OK',
    scheduledJobs: scheduledJobs.size,
    endpoints: {
      createAppointment: 'POST /randevu',
      listAppointments: 'GET /randevular',
      adminLogin: 'POST /admin/login',
      adminAppointments: 'GET /admin/randevular',
      cancelAppointment: 'POST /admin/randevu/:id/iptal',
      deleteAppointment: 'DELETE /admin/randevu/:id'
    }
  });
});

// ---------------- CANLI TAKVİM API'leri ----------------

// Müsait saatleri getir
app.get('/api/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        const selectedDate = new Date(date);
        
        // Tüm müsait saatler
        const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
        
        // Seçili tarihteki randevuları bul
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const appointments = await Appointment.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: 'confirmed'
        });
        
        // Dolu saatleri bul
        const bookedSlots = appointments.map(appt => {
            return appt.date.toTimeString().slice(0, 5);
        });
        
        // Müsait saatleri filtrele
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        
        res.json({
            success: true,
            availableSlots,
            bookedSlots,
            allSlots
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== //
// DEĞERLENDİRME API'LERİ //
// ==================== //

const Review = require('./models/Review');

// Tüm değerlendirmeleri getir
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json({
            success: true,
            reviews: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Yeni değerlendirme oluştur
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, rating, comment } = req.body;
        
        const review = new Review({
            name,
            rating,
            comment,
            status: 'pending' // Admin onayı bekliyor
        });
        
        await review.save();
        
        // Admin'e bildirim gönder
        await sendAdminReviewNotification(review);
        
        res.json({
            success: true,
            message: 'Değerlendirmeniz gönderildi. Onaylandıktan sonra yayınlanacaktır.',
            review: review
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin bildirimi
async function sendAdminReviewNotification(review) {
    try {
        const message = `
            <h2>⭐ Yeni Değerlendirme!</h2>
            <p><strong>Müşteri:</strong> ${review.name}</p>
            <p><strong>Puan:</strong> ${review.rating}/5</p>
            <p><strong>Yorum:</strong> ${review.comment}</p>
            <p><strong>Durum:</strong> Onay Bekliyor</p>
        `;
        
        await sendEmail(ADMIN_EMAIL, '⭐ Yeni Değerlendirme!', message);
        console.log('Admin değerlendirme bildirimi gönderildi');
    } catch (error) {
        console.error('Değerlendirme bildirimi hatası:', error);
    }
}

// Günlük randevu sayısını getir
app.get('/api/appointments/count', async (req, res) => {
    try {
        const { date } = req.query;
        const selectedDate = new Date(date);
        
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const count = await Appointment.countDocuments({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: 'confirmed'
        });
        
        res.json({ success: true, count });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Randevu oluşturma
app.post('/randevu', async (req, res) => {
  try {
    console.log('📝 Randevu isteği:', req.body);
    
    const { name, phone, email, date } = req.body;
    
    if (!name || !phone || !date) {
      return res.status(400).json({
        success: false,
        error: 'İsim, telefon ve tarih zorunludur'
      });
    }
    
    const appointmentDate = new Date(date);
    
    // Geçmiş tarih kontrolü
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Geçmiş bir tarih seçemezsiniz!'
      });
    }
    
    // Randevu çakışması kontrolü
    const conflict = await checkAppointmentConflict(appointmentDate);
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: `Bu saatte zaten randevu var! Müsait saatler: ${getAvailableSlots(appointmentDate)}`
      });
    }
    
    const appointment = new Appointment({
      name,
      phone: phone.replace(/\s/g, ''),
      email: email || '',
      date: appointmentDate,
      status: 'confirmed',
      notificationScheduled: true
    });
    
    await appointment.save();
    console.log('✅ Randevu kaydedildi:', appointment._id);

    // 🔔 HEMEN ADMIN'E BİLDİRİM GÖNDER
    await sendAdminNotification(appointment);

    // 🎯 GERÇEK ZAMAN: Randevudan 1 saat önce hatırlatma
    scheduleReminder(appointment._id.toString(), appointmentDate);

    const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
    
    res.json({
      success: true,
      message: 'Randevu oluşturuldu ve bildirim planlandı! 🎉',
      appointment: appointment,
      reminderNote: `Randevudan 1 saat önce (${reminderTime.toLocaleString('tr-TR')}) hatırlatma gönderilecek`
    });
    
  } catch (error) {
    console.error('❌ Randevu hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Randevuları listele
app.get('/randevular', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json({
      count: appointments.length,
      appointments: appointments,
      scheduledJobs: scheduledJobs.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- ADMIN ROUTES ----------------

// Admin girişi
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Giriş başarılı' });
  } else {
    res.status(401).json({ success: false, error: 'Şifre hatalı' });
  }
});

// Tüm randevuları getir (admin için)
app.get('/admin/randevular', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let filter = {};
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      filter.status = status;
    }
    
    const appointments = await Appointment.find(filter).sort({ date: 1 });
    
    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Randevu iptal etme
app.post('/admin/randevu/:id/iptal', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Randevu bulunamadı' });
    }
    
    // Job'u iptal et
    const jobId = scheduledJobs.get(id);
    if (jobId) {
      clearTimeout(jobId);
      scheduledJobs.delete(id);
    }
    
    // Randevuyu iptal et
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    await appointment.save();
    
    // Müşteriye iptal bildirimi gönder
    await sendCancellationNotification(appointment, reason);
    
    res.json({
      success: true,
      message: 'Randevu iptal edildi ve müşteriye bildirim gönderildi'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Randevu silme
app.delete('/admin/randevu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Job'u iptal et
    const jobId = scheduledJobs.get(id);
    if (jobId) {
      clearTimeout(jobId);
      scheduledJobs.delete(id);
    }
    
    await Appointment.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Randevu silindi'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Planlanmış job'ları listele
app.get('/jobs', (req, res) => {
  res.json({
    scheduledJobs: scheduledJobs.size,
    jobs: Array.from(scheduledJobs.entries()).map(([id, timeout]) => ({
      appointmentId: id,
      status: 'scheduled'
    }))
  });
});

// ---------------- Server Başlatma ----------------
async function startServer() {
  try {
    console.log('🔗 MongoDB bağlanıyor...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
      console.log(`🧔 Berber randevu sistemi HAZIR! (Tüm Özellikler Aktif)`);
      console.log(`⏰ Bildirimler: Randevudan 1 saat önce`);
      console.log(`📢 Admin bildirimleri AKTİF! (Email + WhatsApp + SMS)`);
      console.log(`🛠️ Admin Panel: http://localhost:${PORT}/admin.html`);
      console.log(`🔐 Admin Şifresi: ${ADMIN_PASSWORD}`);
    });
    
  } catch (error) {
    console.error('❌ Server başlatma hatası:', error);
    process.exit(1);
  }
}

startServer();