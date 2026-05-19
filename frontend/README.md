# AgroLens Frontend - React Application

A modern, responsive React-based frontend for the AgroLens tomato disease diagnostic system. The application provides a comprehensive interface for disease prediction, history tracking, and educational resources.

## Features

- **Dashboard**: Overview of predictions, statistics, and quick actions
- **Image Upload & Prediction**: Real-time disease diagnosis using AI models
- **Prediction History**: Track all previous scans with filtering and search
- **Disease Encyclopedia**: Educational resources about tomato diseases
- **User Management**: Profile management, authentication, and account settings
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Header and Footer components
│   ├── pages/
│   │   ├── Dashboard.jsx       # Home/Dashboard page
│   │   ├── Predict.jsx         # Image upload and prediction page
│   │   ├── History.jsx         # Prediction history page
│   │   ├── About.jsx           # Disease encyclopedia page
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   └── Profile.jsx         # User profile page
│   ├── services/
│   │   └── api.js              # API client and endpoints
│   ├── App.jsx                 # Main app component with routing
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup Steps

1. **Clone and navigate to the frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Create environment file**:
```bash
cp .env.example .env.local
```

4. **Update API URL in `.env.local`** (if backend runs on different port):
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Running the Application

### Development Mode
```bash
npm start
```
The app will open at `http://localhost:3000` with hot reload enabled.

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `build/` directory.

## API Integration

The frontend communicates with the backend through the API service layer in `src/services/api.js`. 

### Configured Endpoints

**Authentication**:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

**Disease Prediction**:
- `POST /predict` - Predict disease from image
- `GET /predictions` - Get prediction history
- `GET /predictions/{id}` - Get specific prediction
- `DELETE /predictions/{id}` - Delete prediction

**User Management**:
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/change-password` - Change password
- `DELETE /users/account` - Delete account

**Statistics**:
- `GET /stats/dashboard` - Get dashboard statistics
- `GET /stats/recent` - Get recent predictions

## Backend Integration

### Setting Up Backend Communication

1. **Ensure backend is running** on `http://localhost:8000`
2. **Update API URL** in `.env.local` if backend runs on different port
3. **Backend should have CORS enabled** for `http://localhost:3000`

### Backend Requirements

The backend should implement the following endpoints:

```python
# Example FastAPI/Flask structure
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your API endpoints...
```

## Authentication Flow

1. User logs in via `/login` page
2. Backend returns JWT token
3. Token stored in `localStorage`
4. Token automatically sent with all API requests via interceptor
5. If token expires (401 response), user redirected to login

## Component Architecture

### Layout Components (`Layout.jsx`)
- **Header**: Navigation bar with links and user menu
- **Footer**: Footer with links and copyright info

### Page Components
All pages are in `src/pages/` and handle:
- Data fetching from API
- State management
- User interactions
- Error handling

### API Service (`api.js`)
- Axios instance with base configuration
- Request/response interceptors
- Organized API endpoints by feature
- Automatic token injection in headers

## Styling

Uses **Tailwind CSS** with custom theme:
- Custom color palette matching Material Design 3
- Responsive breakpoints (mobile-first)
- Custom components via `@layer` directives
- Material Symbols icons integration

### Theme Colors
Primary: `#006c49` (Green)
Error: `#ba1a1a` (Red)
Secondary: `#855300` (Orange)
Tertiary: `#005ac2` (Blue)

## Error Handling

- API errors display in user-friendly toast/alert format
- Network errors handled gracefully
- Session expiry redirects to login
- Form validation on client side

## Performance Optimization

- Lazy loading of routes (code splitting)
- Image optimization with lazy loading
- Memoization of components where needed
- Efficient state management

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

### Add New Page
1. Create file in `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add navigation link in `Header.jsx`

### Add New API Endpoint
1. Add method in `src/services/api.js`
2. Import and use in component
3. Handle loading/error states

### Customize Theme
Edit `tailwind.config.js` to modify:
- Colors
- Typography
- Spacing
- Border radius

## Troubleshooting

### CORS Errors
- Ensure backend has CORS middleware configured
- Check `REACT_APP_API_URL` matches backend URL
- Verify credentials are handled correctly

### API Connection Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Or check logs
npm start  # Shows any API errors
```

### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force
npm install
```

## Deployment

### Build for production
```bash
npm run build
```

### Deploy to hosting (example: Vercel)
```bash
npm i -g vercel
vercel
```

Update `REACT_APP_API_URL` environment variable on hosting platform to point to production backend.

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

## License

© 2024 AgroLens Diagnostic Systems. All rights reserved.

## Support

For issues or questions:
- Email: support@agrolens.com
- Documentation: Check REACT_FRONTEND_SETUP.md in project root
