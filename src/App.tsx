/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { ApplicationDetails } from './pages/ApplicationDetails';
import { DocumentRepository } from './pages/DocumentRepository';
import { ScrutinyWorkspace } from './pages/ScrutinyWorkspace';
import { ComplianceRules } from './pages/ComplianceRules';
import { VerificationQueue } from './pages/VerificationQueue';
import { Reports } from './pages/Reports';
import { AuditTrail } from './pages/AuditTrail';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/applications/:id" element={<ApplicationDetails />} />
              <Route path="/documents" element={<DocumentRepository />} />
              <Route path="/scrutiny" element={<ScrutinyWorkspace />} />
              <Route path="/scrutiny/:id" element={<ScrutinyWorkspace />} />
              <Route path="/rules" element={<ComplianceRules />} />
              <Route path="/verification" element={<VerificationQueue />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit-trail" element={<AuditTrail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}
