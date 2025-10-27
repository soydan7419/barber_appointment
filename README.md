🧔 EliteBarber - Premium Men's Grooming Website
<div align="center">
https://img.shields.io/badge/EliteBarber-Premium%2520Grooming-FF6B00?style=for-the-badge&logo=scissors&logoColor=white
https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge
https://img.shields.io/badge/license-MIT-green?style=for-the-badge

Modern, responsive web application for premium men's grooming services with real-time booking system

Features • Technologies • Quick Start • API Setup • Deployment

</div>
✨ Features
🚀 Core Functionality
⚡ PWA - Installable Progressive Web App

🌐 Multi-language - TR/EN/DE Language Support

📱 Fully Responsive - Mobile-First Design

🔔 Push Notifications - Browser Notifications

📅 Live Calendar - Real-time Booking System

⭐ Review System - Customer Ratings & Comments

🎨 Design & UX
Modern UI/UX - Glass Morphism Design

Smooth Animations - Custom CSS Animations

Dark/Light Theme - Automatic Theme Detection

Accessibility - WCAG 2.1 Compliant

💾 Advanced Features
Offline Mode - Service Worker Caching

Fast Loading - Optimized Performance

SEO Optimized - Search Engine Friendly

Secure - OAuth2 Authentication

🛠️ Technologies Used
Frontend
HTML5 - Semantic Markup

CSS3 - Grid, Flexbox, Custom Properties

JavaScript ES6+ - Modern JavaScript Features

PWA - Service Worker, Web App Manifest

Backend
Node.js - Runtime Environment

Express.js - Web Application Framework

MongoDB - NoSQL Database

Mongoose - MongoDB Object Modeling

APIs & Services
Gmail API - Email Notifications with OAuth2

Twilio API - SMS & WhatsApp Integration

Font Awesome 6 - Icon Library

Google Fonts - Inter Font Family

🚀 Quick Start
Prerequisites
Software	Version	Purpose
Node.js	18.x or higher	Backend Runtime
MongoDB	4.4+ or Atlas	Database
Git	2.x+	Version Control
Modern Browser	Chrome 90+	PWA Features
Installation & Setup
bash
# 1. Clone the repository
git clone https://github.com/yourusername/elitebarber.git
cd elitebarber

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your API credentials (see below)

# 4. Start the backend server
npm start

# 5. Open frontend in browser
# Navigate to frontend directory and open index.html
# Or use Live Server extension in VS Code
⚙️ Environment Configuration
Create .env file in backend directory:

env
# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGO_URI=mongodb+srv://elitebarber:yourpassword@cluster0.xxxxx.mongodb.net/berberdb?retryWrites=true&w=majority

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=4000
NODE_ENV=development

# ============================================
# GMAIL API CONFIGURATION
# ============================================
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token_here
GMAIL_USER=yourgmail@gmail.com

# ============================================
# TWILIO API CONFIGURATION
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# ADMINISTRATIVE SETTINGS
# ============================================
ADMIN_PASSWORD=berber123
ADMIN_EMAIL=yourgmail@gmail.com
ADMIN_PHONE=+905551234567

# ============================================
# APPLICATION SETTINGS
# ============================================
APP_URL=http://localhost:4000
CLIENT_URL=http://localhost:3000
📋 API Setup Guide
1. 🗄️ MongoDB Atlas Setup
Step 1: Create Account & Cluster
Visit MongoDB Atlas

Click "Try Free" and register

Create organization: EliteBarber Organization

Create FREE M0 Cluster:

Cloud Provider: AWS

Region: Europe (Ireland)

Cluster Name: elitebarber-cluster

Step 2: Database Configuration
bash
# Database User Creation
Username: elitebarber
Password: StrongPassword123!
Privileges: Read and write to any database

# Network Access
IP Whitelist: 0.0.0.0/0 (Allow from anywhere)

# Connection String Format
mongodb+srv://elitebarber:StrongPassword123!@cluster0.xxxxx.mongodb.net/berberdb?retryWrites=true&w=majority
2. 📧 Gmail API Setup
Step 1: Google Cloud Project
Go to Google Cloud Console

Create project: elitebarber-app

Enable Gmail API

Step 2: OAuth 2.0 Configuration
bash
# OAuth Consent Screen
Application Type: External
App Name: EliteBarber
Support Email: your-email@gmail.com
Scopes: Gmail API (full access)

# OAuth Client ID
Application Type: Web Application
Name: elitebarber-web-client
Redirect URI: https://developers.google.com/oauthplayground
Step 3: Get Refresh Token
Visit OAuth 2.0 Playground

Configure OAuth credentials

Select Gmail API scopes:

https://mail.google.com/

https://www.googleapis.com/auth/gmail.send

https://www.googleapis.com/auth/gmail.compose

Exchange authorization code for tokens

Copy refresh token to .env file

3. 📱 Twilio API Setup
Step 1: Account Setup
Register at Twilio

Verify phone number and email

Step 2: Phone Number & WhatsApp
bash
# Purchase Phone Number
Country: United States (for free trial)
Capabilities: SMS, WhatsApp

# WhatsApp Sandbox
Sandbox Number: Provided by Twilio
Join Code: Unique code for testing
Step 3: API Credentials
Copy these values from Twilio Console:

Account SID

Auth Token

Phone Number

WhatsApp From Number

💻 Development
Project Structure
text
elitebarber/
├── 📁 backend/
│   ├── 📁 controllers/
│   ├── 📁 models/
│   ├── 📁 routes/
│   ├── 📁 middleware/
│   ├── 📁 utils/
│   ├── server.js
│   └── package.json
├── 📁 frontend/
│   ├── 📁 css/
│   ├── 📁 js/
│   ├── 📁 images/
│   ├── 📁 sw/
│   ├── index.html
│   └── manifest.json
└── README.md
Running the Application
Backend Development
bash
cd backend

# Install dependencies
npm install

# Start development server (auto-restart on changes)
npm run dev

# Or start production server
npm start
Frontend Development
bash
cd frontend

# Option 1: Open directly in browser
open index.html

# Option 2: Use Live Server (VS Code extension)
# Right-click index.html > "Open with Live Server"

# Option 3: Use local HTTP server
python -m http.server 3000
# or
npx serve .
🧪 Testing the System
Test 1: API Connection
bash
# Test backend API
curl http://localhost:4000
# Expected: "🎉 Barber API Working!"
Test 2: Database Connection
bash
# Check MongoDB connection
cd backend
node scripts/test-db.js
Test 3: Appointment System
Open index.html in browser

Navigate to "Book Appointment"

Fill test data:

json
{
  "name": "Test Customer",
  "phone": "+905551234567", 
  "email": "test@example.com",
  "date": "2024-01-15T14:00:00",
  "service": "Haircut"
}
Submit and verify in MongoDB Atlas

Test 4: Notifications
bash
# Test email and SMS notifications
cd backend
node scripts/test-notifications.js
🚀 Deployment
Production Build
bash
# Build for production
npm run build

# Start production server
npm start
Environment Variables for Production
env
NODE_ENV=production
PORT=4000
APP_URL=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
📞 Support & Troubleshooting
Common Issues
MongoDB Connection Failed
bash
# Check connection string format
# Verify IP whitelist in MongoDB Atlas
# Test connection:
node scripts/test-connection.js
Gmail API Errors
bash
# Verify OAuth credentials
# Check refresh token validity
# Ensure Gmail API is enabled
Twilio SMS/WhatsApp Issues
bash
# Verify phone number format
# Check account balance
# Test in Twilio sandbox first
Getting Help
Check Logs: backend/logs/ directory

API Status: Verify all external services are operational

Browser Console: Check for frontend errors

Network Tab: Verify API calls are successful

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🤝 Contributing
We welcome contributions! Please see our Contributing Guide for details.

<div align="center">
Built with ❤️ for the modern barber experience

Report Bug • Request Feature • View Demo

</div>
