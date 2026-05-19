import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import History from './pages/History';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './index.css';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  return !isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen bg-background text-on-background">
        {isLoggedIn && <Header />}
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Private Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/predict"
            element={
              <PrivateRoute>
                <Predict />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {isLoggedIn && <Footer />}
      </div>
    </Router>
  );
}

export default App;
