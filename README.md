# Sourceasy - Chemical Trading Platform

A modern web application for chemical trading with AI-powered moderation and supplier management.

## 🚀 Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see Security section below)
4. Start the development server: `npm run dev`

## 🔒 Security Configuration

### Frontend Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Admin Configuration
VITE_ADMIN_EMAILS=meet.r@ahduni.edu.in,jay.r1@ahduni.edu.in
```

### Backend Environment Variables
Create a `.env` file in the `backend` directory with the following variables:

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=chemical-frontend

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# Admin Configuration
ADMIN_EMAILS=meet.r@ahduni.edu.in,jay.r1@ahduni.edu.in

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Security Notes
- **Never commit `.env` files** - they are already in `.gitignore`
- **Use Gmail App Passwords** for email authentication, not your regular password
- **Rotate API keys regularly** for production environments
- **Use HTTPS in production** for all API communications
- **Validate admin emails** through environment variables, not hardcoded values

## Features

- 🔐 Secure authentication with Firebase
- 🤖 AI-powered content moderation
- 📊 Supplier and product management
- 📧 Email notifications
- 👥 Admin dashboard
- 📱 Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: Pinecone (vector database)
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT for moderation
- **Email**: Nodemailer with Gmail

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Backend Setup

See the [backend README](./backend/README.md) for detailed backend setup instructions.
