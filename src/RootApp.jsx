import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import QuickArchitecturePresentation from './components/QuickArchitecturePresentation';
import SimulatorApp from './App';
import { ROUTES } from './routes';

function ProfessionalRoute() {
  const navigate = useNavigate();
  return <SimulatorApp onBackToMenu={() => navigate(ROUTES.home)} />;
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<WelcomeScreen />} />
        <Route path={ROUTES.professional} element={<ProfessionalRoute />} />
        <Route path={`${ROUTES.quick}/:slideId?`} element={<QuickArchitecturePresentation />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}