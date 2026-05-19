# Frontend Development Specification - Tomato Disease Detection App

## Project Overview
**App**: Tomato Disease Detection System  
**Backend API**: http://localhost:8000  
**Tech Stack Recommendation**: React + TypeScript + Tailwind CSS / Material-UI

---

## 📄 Pages Required

### 1. **Authentication Pages**

#### 1.1 Login Page (`/login`)
**Purpose**: User authentication with username and password

**Components**:
- Logo/Header
- Login Form
  - Username input field (text)
  - Password input field (password)
  - "Remember me" checkbox
  - Login button
  - Loading indicator during request
  - Error message display (red alert)
- "Forgot Password?" link
- "Don't have account? Sign up" link

**API Endpoint**: `POST /users/auth/login`
```
Request: { username, password }
Response: { access_token, token_type }
```

**Features**:
- Form validation (required fields)
- Store JWT token in localStorage/sessionStorage
- Redirect to dashboard on success
- Show error messages (Invalid credentials, etc.)
- Persist login state

---

#### 1.2 Registration Page (`/register`)
**Purpose**: Create new user account

**Components**:
- Logo/Header
- Registration Form
  - Email input (with email validation)
  - Username input (minimum 3 characters)
  - Password input (minimum 8 characters, show strength indicator)
  - Confirm Password input
  - Terms & Conditions checkbox
  - Register button
  - Loading indicator
  - Success/Error messages
- "Already have account? Login" link
- Password strength meter

**API Endpoint**: `POST /users/`
```
Request: { email, username, password }
Response: { id, email, username, is_active, created_at, updated_at }
```

**Features**:
- Real-time form validation
- Password strength indicator
- Email format validation
- Duplicate email/username detection
- Auto-redirect to login on success
- Show validation errors for each field

---

#### 1.3 Profile/Settings Page (`/profile`)
**Purpose**: View and edit user profile

**Components**:
- Header with user avatar
- Profile Information Section
  - Display username (read-only)
  - Display email (read-only)
  - Display account creation date
  - Display number of predictions made
- Edit Profile Section
  - Change email button
  - Change password form
    - Current password
    - New password
    - Confirm new password
    - Save button
  - Delete account button (with confirmation modal)
- Logout button

**API Endpoints**: 
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile
- `POST /users/auth/logout` - Logout (optional)

**Features**:
- Load user data on page load
- Update password with validation
- Confirm before account deletion
- Show success/error notifications

---

### 2. **Main Application Pages**

#### 2.1 Dashboard/Home Page (`/`)
**Purpose**: Main hub with quick access to predictions

**Components**:
- Navigation Bar
  - Logo
  - Nav links (Home, Predict, History, Profile)
  - User avatar dropdown (Profile, Logout)
  - Notifications icon
- Hero Section
  - App title
  - Brief description
  - "Get Started" CTA button
- Quick Stats Cards
  - Total predictions made
  - Successful predictions
  - Average confidence score
  - Last prediction date
- Recent Predictions Section
  - Thumbnail grid (max 6 recent predictions)
  - Date, disease name, confidence score
  - "View More" link to history
- Quick Actions
  - "Upload New Image" button (prominent)
  - "View History" button
  - "Learn More" button

**API Endpoints**:
- `GET /users/me` - Get user info
- `GET /predictions` (if available) - Get recent predictions

**Features**:
- Responsive grid layout
- Loading skeletons for stats
- Mobile-friendly design

---

#### 2.2 Disease Prediction Page (`/predict`)
**Purpose**: Upload images and get disease predictions

**Components**:

**Left Section** (Image Upload):
- Upload Box (drag-and-drop area)
  - Drag & drop support
  - Click to browse files
  - File type validation (jpg, png, jpeg)
  - File size validation (max 10MB)
  - Show selected filename
  - Clear/Remove button
- Preview Section
  - Display uploaded image thumbnail
  - Image info (name, size, dimensions)

**Right Section** (Prediction Results):
- Loading State
  - Spinner with "Analyzing image..."
  - Cancel button
- Result Card (when prediction complete)
  - Large disease name display
  - Confidence percentage (with color coding)
    - Green: >80%
    - Yellow: 60-80%
    - Orange: 40-60%
    - Red: <40%
  - Confidence bar (visual)
  - Top 3 Alternative Predictions
    - Disease name
    - Confidence %
    - Progress bar
  - All Probabilities Table (expandable)
    - All 10 classes with percentages
  - Result Metadata
    - Timestamp
    - Prediction ID
  - Action Buttons
    - Save prediction
    - Share result
    - Download report
    - New prediction

**Mobile Layout**:
- Stack vertically
- Image on top
- Results below

**API Endpoint**: `POST /predict/disease`
```
Request: multipart/form-data { file: binary }
Response: {
  prediction_id,
  predicted_class,
  confidence,
  top_3_predictions: [{ class, confidence }],
  all_probabilities: { class: confidence },
  timestamp,
  message
}
```

**Features**:
- Real-time file validation
- Image preview before upload
- Smooth animations for results
- Error handling (file too large, invalid format)
- Copy prediction ID
- Save favorites

---

#### 2.3 Prediction History Page (`/history`)
**Purpose**: View all past predictions

**Components**:
- Filters Section
  - Search by disease name
  - Date range picker (from-to)
  - Confidence range slider (0-100)
  - Sort options (newest, oldest, confidence)
- Results Grid/List
  - Card view or table view toggle
  - Each prediction shows:
    - Thumbnail image
    - Disease name
    - Confidence score with color
    - Date/time
    - Hover action buttons (view, delete)
- Pagination
  - Previous/Next buttons
  - Page numbers
  - Results per page selector
- Empty state
  - Message: "No predictions yet. Start by uploading an image!"
  - CTA button to predict page

**Card Layout**:
```
┌─────────────────┐
│   [Image]       │
├─────────────────┤
│ Disease: Early  │
│ Confidence: 88% │
│ Date: May 15... │
│ [View] [Delete] │
└─────────────────┘
```

**API Endpoint**: `GET /predictions?skip=0&limit=10` (if available)

**Features**:
- Lazy load images
- Infinite scroll or pagination
- Delete predictions with confirmation
- View full details modal
- Download prediction history (CSV)

---

#### 2.4 Prediction Detail Modal (`/prediction/:id`)
**Purpose**: View detailed information about a specific prediction

**Components**:
- Modal Header
  - Close button
  - Prediction ID (copyable)
- Image Display
  - Full-size image
  - Zoom controls
- Detailed Results
  - Disease name (large)
  - Confidence percentage
  - Prediction timestamp
  - Model version info
- All Disease Probabilities Table
  - Scrollable table
  - Class name | Confidence | Visual bar
  - Sort by confidence option
- Actions
  - Share (copy link)
  - Download report (PDF)
  - Delete prediction
  - Save to favorites
- Similar Predictions
  - List of similar results from history
  - Quick links

**API Endpoint**: `GET /predictions/:id` (if available)

---

#### 2.5 About/Learn Page (`/about`)
**Purpose**: Educational content about tomato diseases

**Components**:
- Hero Section
  - Title: "Understanding Tomato Diseases"
  - Subtitle
- Disease Information Cards (10 cards - one per disease)
  - Disease name
  - Symptoms description
  - Treatment recommendations
  - Prevention tips
  - Visual indicator (color badge)
  - "View More" expandable details
- FAQ Section
  - Accordion items
  - Common questions
- Contact Section
  - Email
  - Links to resources

---

### 3. **Common Components (All Pages)**

#### 3.1 Navigation Bar
```
Logo | Home | Predict | History | About
                                    [User Avatar ▼]
                                    - Profile
                                    - Settings
                                    - Logout
```

**Features**:
- Active link highlighting
- Mobile hamburger menu
- Responsive design
- Logo links to home

#### 3.2 Footer
```
© 2026 Tomato Disease Detection
Privacy | Terms | Contact | GitHub
```

#### 3.3 Authentication Guard
- Check token validity
- Redirect to login if unauthorized
- Refresh token logic

#### 3.4 Error Boundary
- Catch errors
- Display user-friendly messages
- Recovery button

#### 3.5 Loading Spinner
- Multiple sizes
- Color variants
- Animated

#### 3.6 Toast Notifications
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)
- Auto-dismiss after 5 seconds
- Stacking support

#### 3.7 Modals/Dialogs
- Confirm dialogs (Yes/No)
- Info dialogs
- Form modals
- Scroll body lock
- Click outside to close (with warning if data changed)

#### 3.8 Form Inputs
- Text inputs
- Email inputs
- Password inputs
- File inputs
- Select dropdowns
- Checkboxes
- Radio buttons
- Validation error messages
- Required field indicators

---

## 🎨 Design System & Styling

### Color Palette
```
Primary: #10b981 (Green - healthy)
Secondary: #f59e0b (Amber - warning)
Danger: #ef4444 (Red - disease risk)
Info: #3b82f6 (Blue)
Background: #f9fafb (Light gray)
Text: #111827 (Dark gray)
Border: #e5e7eb (Light border)
```

### Typography
- **Headers**: Roboto / Inter (bold, 28-32px)
- **Body**: Roboto / Inter (regular, 14-16px)
- **Small**: Roboto / Inter (regular, 12px)

### Spacing
- 8px, 16px, 24px, 32px, 48px units

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

## 🔧 State Management

**Store Structure**:
```javascript
{
  auth: {
    isAuthenticated: boolean,
    user: { id, email, username },
    token: string,
    loading: boolean
  },
  predictions: {
    currentPrediction: { ... },
    history: [ ... ],
    loading: boolean,
    error: string
  },
  ui: {
    notification: { type, message },
    sidebarOpen: boolean,
    darkMode: boolean
  }
}
```

---

## 📱 Responsive Design Requirements

### Mobile (320px - 480px)
- Single column layout
- Full-width buttons
- Hamburger menu
- Bottom navigation option
- Touch-friendly (min 48px tap targets)

### Tablet (481px - 768px)
- 2 column layout where appropriate
- Optimized spacing
- Sidebar or hamburger menu

### Desktop (769px+)
- Multi-column layouts
- Fixed sidebar navigation
- Expanded detail views
- Hover effects

---

## 🔐 Security Considerations

1. **JWT Token Storage**
   - Store in httpOnly cookie (if possible)
   - OR localStorage with XSS protection
   - Clear on logout

2. **API Security**
   - CORS headers validation
   - Secure API calls over HTTPS
   - Request timeout handling
   - Rate limiting awareness

3. **Input Validation**
   - Client-side validation
   - Sanitize user inputs
   - File type/size validation

4. **Error Handling**
   - Don't expose sensitive info in errors
   - Log errors securely
   - User-friendly error messages

---

## 📊 Performance Optimization

1. **Image Optimization**
   - Lazy loading for preview thumbnails
   - WebP format with fallback
   - Responsive image sizes
   - CDN delivery (if available)

2. **Code Splitting**
   - Route-based code splitting
   - Component-level splitting
   - Lazy load modals

3. **Caching**
   - Cache API responses
   - Service worker for offline support
   - Local storage for user preferences

4. **Rendering**
   - Virtual lists for history page
   - Memoization for expensive components
   - Debounce search/filter

---

## 🧪 Testing Requirements

### Unit Tests
- Form validation logic
- API error handling
- State management reducers

### Integration Tests
- Login flow
- Prediction upload flow
- History loading and filtering

### E2E Tests
- Complete user journey (register → predict → view history)
- Authentication flows
- Error scenarios

---

## 📦 Dependencies Recommendation

```json
{
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.4.0",
  "zustand": "^4.0.0",
  "tailwindcss": "^3.0.0",
  "react-dropzone": "^14.0.0",
  "react-hot-toast": "^2.4.0",
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0"
}
```

---

## 🚀 Implementation Priority

**Phase 1** (MVP):
1. Login/Register pages
2. Dashboard page
3. Prediction page
4. Navigation bar

**Phase 2**:
5. History page
6. Profile page
7. About page

**Phase 3** (Enhancement):
8. Detailed analytics
9. Favorites/bookmarks
10. Social sharing
11. Download reports

---

## 📋 Checklist for Frontend Developer

- [ ] Setup React project with TypeScript
- [ ] Configure routing structure
- [ ] Setup state management
- [ ] Create authentication service
- [ ] Create API service/client
- [ ] Build all pages
- [ ] Build all components
- [ ] Implement form validation
- [ ] Setup error handling
- [ ] Add loading states
- [ ] Make responsive design
- [ ] Add animations/transitions
- [ ] Setup environment variables
- [ ] Configure API base URL
- [ ] Test all flows
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Deploy to hosting

---

**Total Estimated Components**: ~30-40 components  
**Total Pages**: 7-8 main pages  
**Estimated Dev Time**: 3-4 weeks (depending on team size)
