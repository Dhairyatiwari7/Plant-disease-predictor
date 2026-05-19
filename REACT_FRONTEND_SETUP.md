# AgroLens React Frontend Setup Guide

## Project Structure

```
agrolens-frontend/
├── src/
│   ├── components/
│   │   ├── NavBar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Card.jsx
│   │       └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Predict.jsx
│   │   ├── History.jsx
│   │   ├── About.jsx
│   │   └── Profile.jsx
│   ├── services/
│   │   ├── api.js (Axios instance)
│   │   └── authService.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── styles/
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Installation Steps

```bash
# Create React app with Vite
npm create vite@latest agrolens-frontend -- --template react
cd agrolens-frontend

# Install dependencies
npm install
npm install axios react-router-dom tailwindcss postcss autoprefixer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm run dev
```

## Backend API Configuration

Base URL: `http://localhost:8000`

### API Endpoints Used:
- `POST /users/auth/login` - User login
- `POST /users/` - User registration
- `GET /users/me` - Get current user
- `POST /predict/disease` - Disease prediction
- `GET /predictions` - Get prediction history

## Features Implemented

✅ JWT Authentication
✅ Protected Routes
✅ Form Validation
✅ Image Upload with Preview
✅ Real-time API Integration
✅ Error Handling
✅ Loading States
✅ Responsive Design (Mobile, Tablet, Desktop)
✅ Token Refresh
✅ Logout Functionality

## Key Technologies

- React 18
- Vite
- Tailwind CSS
- Axios
- React Router v6
- Context API for state management

## Environment Variables

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```
