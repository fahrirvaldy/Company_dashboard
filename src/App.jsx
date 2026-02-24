import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const MeetingTool = lazy(() => import('./pages/MeetingTool'));
const GrowthSimulator = lazy(() => import('./pages/GrowthSimulator'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex justify-center items-center h-screen font-black text-[#FF8c42] text-2xl animate-pulse tracking-tighter">AKSANA</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="meeting" element={<MeetingTool />} />
            <Route path="simulator" element={<GrowthSimulator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
