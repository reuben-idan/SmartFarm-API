# SmartFarm Deployment Guide

## 🚀 Quick Vercel Deployment

### Frontend Deployment:
```bash
cd frontend
vercel --prod
```

### Or via Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Deploy

### Backend API Update:
Update the API base URL in `frontend/app.js`:
```javascript
// Change from:
this.API_BASE = 'http://127.0.0.1:8000/api';

// To your deployed backend URL:
this.API_BASE = 'https://your-backend-url.com/api';
```

## 📋 Deployment Checklist:
- ✅ Frontend files ready
- ✅ vercel.json configured
- ✅ Logo image included
- ✅ Chart.js CDN linked
- ✅ Ghana-specific data implemented

## 🔗 Live URLs:
- Frontend: https://your-app.vercel.app
- Backend: Update API_BASE in app.js