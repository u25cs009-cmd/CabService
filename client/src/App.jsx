import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './admin/context/AuthContext';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import VehiclesPage from './pages/VehiclesPage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from './admin/pages/AdminLoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import BookingsPage from './admin/pages/BookingsPage';
import VehiclesAdminPage from './admin/pages/VehiclesAdminPage';
import DriversAdminPage from './admin/pages/DriversAdminPage';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Panel Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vehicles"
              element={
                <ProtectedRoute>
                  <VehiclesAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/drivers"
              element={
                <ProtectedRoute>
                  <DriversAdminPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}
