import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import QuickArchitecturePresentation from './components/QuickArchitecturePresentation';
import SimulatorApp from './App';

/**
 * Shell de navegación: bienvenida → simulador profesional o arquitectura rápida.
 */
export default function RootApp() {
  const [view, setView] = useState('welcome');

  if (view === 'welcome') {
    return (
      <WelcomeScreen
        onSelectProfessional={() => setView('professional')}
        onSelectQuick={() => setView('quick')}
      />
    );
  }

  if (view === 'quick') {
    return <QuickArchitecturePresentation onBack={() => setView('welcome')} />;
  }

  return <SimulatorApp onBackToMenu={() => setView('welcome')} />;
}