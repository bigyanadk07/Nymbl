import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';

import Home from './pages/Global/Home';
import AuthPage from './pages/Auth/Auth';

import DashboardLayout from './pages/Dashboard/DashboardLayout';

import DashboardOverview from './pages/Dashboard/Dashboard';
import ApiTokens from './pages/Dashboard/Sections/ApiTokens';
import UsageOverview from './pages/Dashboard/Sections/UsuageOverview';
import DashboardSubscriptions from './pages/Dashboard/Sections/Subscriptions';
import UserInvoice from './pages/Dashboard/Sections/Invoice';

import Packages from './pages/Subscriptions/Packages';
import PackageDetails from './pages/Subscriptions/PackageDetails';

import Success from './components/payment/PaymentSuccess';
import Failure from './components/payment/PaymentFailure';


const App: React.FC = () => {

  return (

    <Router>

      <AuthProvider>

        <div className="min-h-screen bg-gray-50">

          <Navbar />

          <Routes>

            {/* ==================================================
                PUBLIC ROUTES
            ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/auth"
              element={<AuthPage />}
            />

            <Route
              path="/payment/success"
              element={<Success />}
            />

            <Route
              path="/payment/failure"
              element={<Failure />}
            />


            {/* ==================================================
                DASHBOARD
            ================================================== */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >

              {/* -----------------------------------------------
                  Dashboard Overview
              ----------------------------------------------- */}

              <Route
                index
                element={<DashboardOverview />}
              />


              {/* -----------------------------------------------
                  API Tokens
              ----------------------------------------------- */}

              <Route
                path="api-tokens"
                element={<ApiTokens />}
              />


              {/* -----------------------------------------------
                  Usage
              ----------------------------------------------- */}

              <Route
                path="usage"
                element={<UsageOverview />}
              />

              {/* -----------------------------------------------
                  Invoice
              ----------------------------------------------- */}

              <Route
                path="invoices"
                element={<UserInvoice />}
              />


              {/* -----------------------------------------------
                  Subscriptions
              ----------------------------------------------- */}

              <Route
                path="subscriptions"
                element={<DashboardSubscriptions />}
              />

            </Route>


            {/* ==================================================
                PACKAGE ROUTES
            ================================================== */}

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

