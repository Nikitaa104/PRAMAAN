import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { DecisionSupportBanner } from '../common/DecisionSupportBanner';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#1F2937] flex flex-col font-sans">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <DecisionSupportBanner />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
