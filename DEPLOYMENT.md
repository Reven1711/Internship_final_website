# Sourceasy Deployment Guide

This guide will help you deploy Sourceasy to production with easy URL configuration.

## 🚀 Quick Deployment Setup

### 1. Frontend Deployment

#### Environment Configuration
1. Copy `env.example` to `.env` in the root directory
2. Update the following variables:

```bash
# Development
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173

# Production (replace with your actual URLs)
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_URL=https://your-frontend-domain.com
```

#### Firebase Configuration
Update Firebase config with your production values:
```bash
VITE_FIREBASE_API_KEY=your_production_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Build and Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to your hosting platform (Vercel, Netlify, etc.)
```

### 2. Backend Deployment

#### Environment Configuration
1. Copy `backend/env.example` to `backend/.env`
2. Update the following variables:

```bash
# Development
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# Production (replace with your actual URLs)
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

#### API Keys Configuration
Update all API keys with production values:
```bash
PINECONE_API_KEY=your_production_pinecone_key
OPENAI_API_KEY=your_production_openai_key
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_production_email_password
```

#### Deploy Backend
```bash
cd backend

# Install dependencies
npm install

# Start production server
npm start
```

## 🌐 Deployment Platforms

### Frontend Hosting Options

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Netlify
1. Connect your GitHub repository
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Backend Hosting Options

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically

#### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
git push heroku main
```

## 🔧 URL Configuration Examples

### Development
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173

# Backend (.env)
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### Production Examples

#### Example 1: Vercel + Railway
```bash
# Frontend (.env)
VITE_API_BASE_URL=https://sourceasy-backend.railway.app
VITE_APP_URL=https://sourceasy.vercel.app

# Backend (.env)
FRONTEND_URL=https://sourceasy.vercel.app
CORS_ORIGIN=https://sourceasy.vercel.app
```

#### Example 2: Netlify + Render
```bash
# Frontend (.env)
VITE_API_BASE_URL=https://sourceasy-backend.onrender.com
VITE_APP_URL=https://sourceasy.netlify.app

# Backend (.env)
FRONTEND_URL=https://sourceasy.netlify.app
CORS_ORIGIN=https://sourceasy.netlify.app
```

#### Example 3: Custom Domains
```bash
# Frontend (.env)
VITE_API_BASE_URL=https://api.sourceasy.ai
VITE_APP_URL=https://www.sourceasy.ai

# Backend (.env)
FRONTEND_URL=https://www.sourceasy.ai
CORS_ORIGIN=https://www.sourceasy.ai
```

## 🔒 Security Checklist

### Frontend
- [ ] Environment variables are set in hosting platform
- [ ] Firebase config is production-ready
- [ ] API base URL points to production backend
- [ ] HTTPS is enabled

### Backend
- [ ] All API keys are production values
- [ ] CORS is configured for production frontend
- [ ] NODE_ENV is set to production
- [ ] Environment variables are secure
- [ ] HTTPS is enabled

## 📝 Post-Deployment

1. **Test all functionality** on production URLs
2. **Verify API calls** are working correctly
3. **Check CORS** is not blocking requests
4. **Monitor logs** for any errors
5. **Update DNS** if using custom domains

## 🆘 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure `CORS_ORIGIN` in backend matches frontend URL exactly
- Check for trailing slashes
- Verify HTTPS vs HTTP

#### API Connection Issues
- Verify `VITE_API_BASE_URL` points to correct backend
- Check backend is running and accessible
- Ensure environment variables are set correctly

#### Build Errors
- Check all environment variables are defined
- Verify Firebase configuration
- Ensure all dependencies are installed

## 📞 Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check hosting platform logs for errors
4. Ensure URLs are accessible and CORS is configured properly 