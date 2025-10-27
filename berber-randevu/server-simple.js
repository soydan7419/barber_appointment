require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Models/Appointment.js'yi doğru import et
const Appointment = require('./models/Appointment');

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 Berber API Çalışıyor!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Sağlık kontrol endpoint'i
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Randevu oluşturma
app.post('/randevu', async (req, res) => {
  try {
    console.log('📝 Yeni randevu isteği alındı');
    
    const { name, phone, email, date } = req.body;
    
    // Validasyon
    if (!name || !phone || !email || !date) {
      return res.status(400).json({
        success: false,
        error: 'Tüm alanlar zorunludur: name, phone, email, date'
      });
    }

    const appointment = new Appointment({
      name,
      phone,
      email,
      date: new Date(date),
      notificationScheduled: false,
      createdAt: new Date()
    });
    
    await appointment.save();
    console.log('✅ Randevu kaydedildi:', appointment._id);
    
    res.json({
      success: true,
      message: 'Randevu başarıyla oluşturuldu! 🎉',
      appointment: appointment,
      reminderNote: 'Randevu hatırlatıcıları aktif değil (test modu)'
    });
    
  } catch (error) {
    console.error('❌ Randevu oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Randevu oluşturulurken bir hata oluştu: ' + error.message
    });
  }
});

// Tüm randevuları listele
app.get('/randevular', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    console.error('❌ Randevu listeleme hatası:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ID'ye göre randevu getir
app.get('/randevu/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Randevu bulunamadı'
      });
    }
    res.json({
      success: true,
      appointment: appointment
    });
  } catch (error) {
    console.error('❌ Randevu getirme hatası:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Randevu silme
app.delete('/randevu/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Randevu bulunamadı'
      });
    }
    res.json({
      success: true,
      message: 'Randevu başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Randevu silme hatası:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('🚨 Uygulama hatası:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Server başlat
async function startServer() {
  try {
    console.log('🔗 MongoDB bağlanıyor...');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable tanımlı değil');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB bağlantısı başarılı');
    
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
      console.log(`💈 Berber randevu sistemi aktif!`);
      console.log(`📊 Ortam: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM alındı, server kapatılıyor...');
      server.close(() => {
        mongoose.connection.close();
        console.log('✅ Server başarıyla kapatıldı');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Server başlatma hatası:', error);
    process.exit(1);
  }
}

// Uygulamayı başlat
if (require.main === module) {
  startServer();
}

module.exports = app;