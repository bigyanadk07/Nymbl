// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Home from './pages/Global/Home';
import AuthPage from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import Packages from './pages/Dashboard/Packages';
import PackageDetails from './pages/Dashboard/PackageDetails';
import Success from './components/payment/PaymentSuccess';
import Failure from './components/payment/PaymentFailure';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/payment/success" element={<Success />} />
            <Route path="/payment/failure" element={<Failure />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/packages"
              element={
                <ProtectedRoute>
                  <Packages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/packages/:id"
              element={
                <ProtectedRoute>
                  <PackageDetails />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;