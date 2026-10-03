import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './admin/context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import VehiclesPage from './pages/VehiclesPage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ReceiptPage from './pages/ReceiptPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CustomerAccountPage from './pages/CustomerAccountPage';
import ReviewPage from './pages/ReviewPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from './admin/pages/AdminLoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import BookingsPage from './admin/pages/BookingsPage';
import VehiclesAdminPage from './admin/pages/VehiclesAdminPage';
import DriversAdminPage from './admin/pages/DriversAdminPage';
import FareRulesAdminPage from './admin/pages/FareRulesAdminPage';
import CouponsAdminPage from './admin/pages/CouponsAdminPage';
import ReviewsAdminPage from './admin/pages/ReviewsAdminPage';

import CompaniesAdminPage from './admin/pages/CompaniesAdminPage';
import InvoicesAdminPage from './admin/pages/InvoicesAdminPage';
import AnalyticsAdminPage from './admin/pages/AnalyticsAdminPage';

import CustomerTrackingPage from './pages/CustomerTrackingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LiveMapAdminPage from './admin/pages/LiveMapAdminPage';

import { DriverAuthProvider } from './driver/DriverAuthContext';
import DriverProtectedRoute from './driver/DriverProtectedRoute';
import DriverLoginPage from './driver/DriverLoginPage';
import DriverHomePage from './driver/DriverHomePage';
import DriverActiveTripPage from './driver/DriverActiveTripPage';
import DriverHistoryPage from './driver/DriverHistoryPage';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CustomerAuthProvider>
          <DriverAuthProvider>
            <Router>
              <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/booking/receipt/:referenceCode" element={<ReceiptPage />} />
                <Route path="/login" element={<CustomerLoginPage />} />
                <Route path="/register" element={<CustomerRegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/account" element={<CustomerAccountPage />} />
                <Route path="/review/:referenceCode" element={<ReviewPage />} />
                <Route path="/track/:trackingToken" element={<CustomerTrackingPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Driver App Routes (Noindex PWA) */}
                <Route path="/driver/login" element={<DriverLoginPage />} />
                <Route
                  path="/driver"
                  element={
                    <DriverProtectedRoute>
                      <DriverHomePage />
                    </DriverProtectedRoute>
                  }
                />
                <Route
                  path="/driver/active-trip"
                  element={
                    <DriverProtectedRoute>
                      <DriverActiveTripPage />
                    </DriverProtectedRoute>
                  }
                />
                <Route
                  path="/driver/history"
                  element={
                    <DriverProtectedRoute>
                      <DriverHistoryPage />
                    </DriverProtectedRoute>
                  }
                />

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
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsAdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/live-map"
                  element={
                    <ProtectedRoute>
                      <LiveMapAdminPage />
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
                  path="/admin/companies"
                  element={
                    <ProtectedRoute>
                      <CompaniesAdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/invoices"
                  element={
                    <ProtectedRoute>
                      <InvoicesAdminPage />
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
                <Route
                  path="/admin/fare-rules"
                  element={
                    <ProtectedRoute>
                      <FareRulesAdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/coupons"
                  element={
                    <ProtectedRoute>
                      <CouponsAdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute>
                      <ReviewsAdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </DriverAuthProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

