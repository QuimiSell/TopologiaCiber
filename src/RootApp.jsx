import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import QuickArchitecturePresentation from './components/QuickArchitecturePresentation';
import SimulatorApp from './App';
import { ROUTES } from './routes';

export default function RootApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<WelcomeScreen />} />
        <Route path={ROUTES.professional} element={<SimulatorApp />} />
        <Route path={`${ROUTES.quick}/:slideId?`} element={<QuickArchitecturePresentation />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}