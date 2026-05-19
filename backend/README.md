# Plant Disease Detection API

A production-ready FastAPI backend with user management and MongoDB integration.

## 🚀 Quick Start

```bash
# Navigate to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

API will be available at: http://localhost:8000

## 📁 Project Structure

```
backend/
│
├── main.py              # Entry point
├── database.py         # MongoDB connection
├── auth.py             # Authentication utilities
├── config.py           # Configuration settings
├── models/             # Data models
│   └── user.py
├── routes/             # API routes
│   └── user_routes.py
└── schemas/            # Pydantic schemas
    └── user_schema.py
```

## 📚 API Endpoints

### Authentication
```bash
POST /users/auth/login
```

### User Management
```bash
POST /users/              # Create user
GET  /users/me           # Get current user
PUT  /users/me           # Update current user
GET  /users/             # List users (admin)
```

### Root
```bash
GET /
```

## 🔧 Configuration

Update `.env` with your settings:

```bash
DEBUG=False
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=plant_disease_db

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

SECRET_KEY=your-production-secret-key-change-this-in-production
```

## 🗄️ Database Setup

Ensure MongoDB is running and accessible at the configured URL.

## 📦 Dependencies

- FastAPI - Web framework
- Motor - MongoDB async driver
- PyMongo - MongoDB driver
- Pydantic - Data validation
- Jose - JWT tokens
- PassLib - Password hashing
- Uvicorn - ASGI server

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation

## 🧪 Testing

```bash
# Test import
python -c "from main import app; print('✓ Import successful')"
```

## 📄 Interactive Documentation

Visit http://localhost:8000/docs for Swagger UI with interactive testing.
