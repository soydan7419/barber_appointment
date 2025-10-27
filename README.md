🧔 EliteBarber - Premium Men's Grooming Website
✨ Features
⚡ PWA - Progressive Web App (Installable)

🌐 Multi-language - TR/EN/DE Support

📱 Fully Responsive - Mobile First Design

🔔 Push Notifications - Browser Notifications

📅 Live Calendar - Real-time Booking System

⭐ Review System - Customer Ratings & Comments

🎨 Modern UI/UX - Glass Morphism Design

💾 Offline Mode - Service Worker Caching

🛠️ Technologies Used
Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend: Node.js, Express.js, MongoDB

PWA: Service Worker, Web App Manifest

Styling: CSS Grid, Flexbox, Custom Animations

Icons: Font Awesome 6

Fonts: Google Fonts (Inter)

Email: Gmail API with OAuth2

SMS/WhatsApp: Twilio API

🚀 SETUP AND RUNNING GUIDE
📋 APPLICATIONS I USED
Required Software:
Visual Studio Code - Code editor

Node.js (v18 or higher) - Backend runtime

MongoDB Compass - Database visual interface (optional)

Git Bash or Windows PowerShell - Terminal

Google Chrome - For testing and PWA features

API Accounts (FREE):
MongoDB Atlas - Cloud database

Google Cloud Console - For Gmail API

Twilio - For SMS and WhatsApp messages

🔧 STEP-BY-STEP SETUP
1. 🗄️ MONGODB ATLAS SETUP
Step 1: Create MongoDB Atlas Account
Go to MongoDB Atlas

Click "Try Free" button

Register with email

Create organization by clicking "Create a organization"

Step 2: Create Cluster
Click "Create a Cluster" button

Select FREE tier (M0 - Free)

Select AWS as cloud provider

Select a region from Europe (faster)

Click "Create Cluster" button (may take 5-10 minutes)

Step 3: Create Database User
When cluster is ready, click "Database Access" tab

Click "Add New Database User" button

Authentication Method: Password

Username: elitebarber

Password: Set a strong password (e.g., 741741Aa.)

Database User Privileges: Read and write to any database

Click "Add User" button

Step 4: Add IP Whitelist
Click "Network Access" tab

Click "Add IP Address" button

Check "Allow Access from Anywhere" option (0.0.0.0/0)

Click "Confirm" button

Step 5: Get Connection String
Return to "Clusters" tab

Click "Connect" button

Select "Connect your application" option

Driver: Node.js

Version: 4.1 or later

Copy connection string:

text
mongodb+srv://elitebarber:741741Aa.@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
2. 📧 GMAIL API SETUP
Step 1: Create Google Cloud Console Project
Go to Google Cloud Console

Login with your Google account

Click "Select a project" > "New Project"

Project name: elitebarber-app

Click "Create" button

Step 2: Enable Gmail API
Select "APIs & Services" > "Library" from left menu

Type "Gmail API" in search box

Select Gmail API and click "Enable" button

Step 3: Create OAuth 2.0 Credentials
Select "APIs & Services" > "Credentials"

Click "Create Credentials" > "OAuth 2.0 Client IDs"

Click "Configure consent screen" button

User Type: External > Create

App name: EliteBarber

User support email: Select your email

Developer contact information: Enter your email

Click "Save and Continue" button

In Scopes section, click "Save and Continue"

In test users section, add your email > "Save and Continue"

Step 4: Create OAuth Client ID
Return to "Credentials" tab

Click "Create Credentials" > "OAuth 2.0 Client IDs"

Application type: Web application

Name: elitebarber-web-client

Authorized redirect URIs:

text
https://developers.google.com/oauthplayground
Click "Create" button

Copy Client ID and Client Secret values

Step 5: Get Refresh Token
Go to OAuth 2.0 Playground

Click ⚙️ (settings) icon at top right

Check "Use your own OAuth credentials"

OAuth Client ID: Client ID from Google Cloud

OAuth Client secret: Client Secret from Google Cloud

Click "Close" button

In "Step 1" section on left, select Gmail API v1:

https://mail.google.com/

https://www.googleapis.com/auth/gmail.send

https://www.googleapis.com/auth/gmail.compose

Click "Authorize APIs" button

Login with your Google account and approve permissions

"Step 2" - Click "Exchange authorization code for tokens" button

Copy Refresh token value

3. 📱 TWILIO API SETUP
Step 1: Create Twilio Account
Go to Twilio

Click "Get a Free API Key" button

Register with email and verify phone number

In "Choose a Product" section, select "SMS" and "WhatsApp"

Step 2: Get Phone Number
In Twilio Console, click "Phone Numbers" > "Manage" > "Buy a Number"

Select "United States" as country (for free trial)

Select available number and click "Buy" button

Save the purchased number

Step 3: WhatsApp Sandbox Setup
In Twilio Console, click "Messaging" > "Try it out" > "Send a WhatsApp message"

Click "Get started with the Sandbox" button

Save sandbox number and join code

Send join code to sandbox number via WhatsApp

Step 4: Get API Information
In Twilio Console dashboard:

Copy Account SID value

Copy Auth Token value

Copy Phone Number value

Copy WhatsApp From value (whatsapp:+14155238886)

4. ⚙️ FILLING THE .ENV FILE
Fill the .env file in project directory as follows:

env
# MongoDB Connection (from Atlas)
MONGO_URI=mongodb+srv://elitebarber:741741Aa.@cluster0.xxxxx.mongodb.net/berberdb?retryWrites=true&w=majority

# Server Port
PORT=4000

# Gmail API (from Google Cloud)
GMAIL_CLIENT_ID=49898771535-hvu880kd9o3ppba83jit654lb8kprbdh.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=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
GMAIL_REFRESH_TOKEN=1//04acTqV6qmniDCgYIARAAGAQSNwF-L9IrQGTMUefkxzKpb_JhDdtUz3IpQv_oD8BOsjirMlpZn3H8MeyFJzrRAuXZB4AoeK4XQt4
GMAIL_USER=soydankadir19@gmail.com

# Twilio API (from Twilio)
TWILIO_ACCOUNT_SID=ACf3399a386d3fb244e5912218ce2280d7
TWILIO_AUTH_TOKEN=d830f907472b5267bb2456fe73007404
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_NUMBER=+15055551234

# Admin Settings
ADMIN_PASSWORD=berber123
ADMIN_EMAIL=soydankadir19@gmail.com
ADMIN_PHONE=+905466592920
5. 💻 RUNNING THE PROJECT
Starting Backend with PowerShell:
powershell
# 1. Navigate to project directory
cd C:\path\to\elitebarber-project

# 2. Go to backend directory
cd backend

# 3. Install required packages
npm install

# 4. Start backend server
npm start

# Or start in development mode (auto-detects changes)
npm run dev
You should see success message:

text
🚀 Server running: http://localhost:4000
🧔 Barber appointment system READY!
✅ MongoDB connection successful
Testing Frontend:
Backend test in browser:

Open Chrome

Go to http://localhost:4000

You should see "🎉 Barber API Working!" message

Testing HTML file:

Open index.html directly in browser

Or open with Live Server extension

6. 🧪 SYSTEM TESTS
Test 1: API Connection Test
powershell
# Open new PowerShell window and test:
curl http://localhost:4000
# Or open http://localhost:4000 in browser
Test 2: Appointment System Test
Open index.html in browser

Go to "Book Appointment" section

Enter test information:

Name: Test User

Phone: +905551234567

Email: test@example.com

Date: Tomorrow 14:00

Click "Create Appointment" button

Test 3: MongoDB Check
Go to MongoDB Atlas

Click Cluster > Collections

You should see new appointment in berberdb > appointments collection

Test 4: Notification Test
powershell
# Run test script
cd backend
node test-notifications.js
