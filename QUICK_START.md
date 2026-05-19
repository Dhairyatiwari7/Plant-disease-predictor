# Quick Setup Guide - AgroLens Frontend + Backend

## 📋 Prerequisites
- Node.js 16+ ([Download](https://nodejs.org))
- Python 3.8+ ([Already installed](https://python.org))
- Backend running on port 8000
- Frontend will run on port 3000

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 2: Create Environment File
```bash
cd frontend
cp .env.example .env.local
# Keep default: REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Install Backend Dependencies (if not already done)
```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Start Backend (Terminal 1)
```bash
cd backend
python main.py
# Backend runs on http://localhost:8000
```

### Step 5: Start Frontend (Terminal 2)
```bash
cd frontend
npm start
# Frontend opens automatically at http://localhost:3000
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can load login page
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] Can upload image and get prediction
- [ ] Can view prediction history
- [ ] Can update profile

---

## 📱 Main Features

| Feature | URL | Status |
|---------|-----|--------|
| Login | `/login` | ✓ |
| Register | `/register` | ✓ |
| Dashboard | `/` (home) | ✓ |
| Upload & Predict | `/predict` | ✓ |
| History | `/history` | ✓ |
| Disease Info | `/about` | ✓ |
| Profile | `/profile` | ✓ |

---

## 🔧 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Can't connect to backend
- Check backend is running: `http://localhost:8000`
- Verify `.env.local` has correct API URL
- Check browser console for CORS errors

### Backend CORS errors
- Add CORS middleware in `backend/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Image upload fails
- Ensure backend has proper file handling
- Check `backend/main.py` has POST `/api/predict` endpoint

---

## 📚 Full Documentation

- **Frontend Setup**: [frontend/README.md](frontend/README.md)
- **Integration Guide**: [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
- **Backend Setup**: [backend/README.md](backend/README.md)
- **React Setup Guide**: [REACT_FRONTEND_SETUP.md](REACT_FRONTEND_SETUP.md)

---

## 🎨 Customization

### Change API URL
Edit `frontend/.env.local`:
```
REACT_APP_API_URL=https://your-backend.com/api
```

### Change Port
Frontend: Edit `frontend/package.json` and change start script
Backend: Change port in `backend/main.py`

### Add New Features
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add API endpoint in backend
4. Add navigation link in `frontend/src/components/Layout.jsx`

---

## 🔐 Security Notes

1. Change JWT secret in backend before production
2. Use HTTPS for production
3. Never commit `.env` files with secrets
4. Validate all user inputs on backend

---

## 📦 Project Structure

```
DL Project/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/         # Shared components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service
│   │   └── App.jsx             # Routing
│   ├── package.json
│   └── .env.local              # (create after .env.example)
├── backend/                     # Python FastAPI
│   ├── main.py                 # Entry point
│   ├── auth.py                 # Authentication
│   ├── routes/                 # API routes
│   └── requirements.txt
└── FRONTEND_BACKEND_INTEGRATION.md
```

---

## 🤝 Need Help?

1. Check browser console (F12) for error messages
2. Check backend terminal for API errors
3. Review [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
4. Check backend `requirements.txt` matches installed packages

---

## 📋 Environment Variables Reference

**Frontend** (.env.local):
```
REACT_APP_API_URL=http://localhost:8000/api   # Backend API URL
REACT_APP_ENV=development                      # development/production
```

---

## ✨ Next Steps

1. ✅ Run frontend and backend
2. ✅ Test login/register flow
3. ✅ Upload image and test prediction
4. ✅ Verify all pages load correctly
5. Deploy to production when ready

Happy diagnosing! 🌱
