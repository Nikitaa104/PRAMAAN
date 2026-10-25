import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Menu,
  ChevronDown,
  Building,
  UserCircle2,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, switchUser, availableUsers } = useAuth();
  const { showNotification } = useNotification();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (!window.confirm('Reset the PRAMAN regulatory database to the default demonstration seed state?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetSeedData(currentUser.name, currentUser.role);
      showNotification('success', 'Database Reset', 'System state successfully refreshed to synthetic demonstration seed records.');
      window.location.reload();
    } catch (err: any) {
      showNotification('error', 'Reset Failed', err.message || 'Unable to reset demonstration records.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#D6DEE8] sticky top-0 z-40">
      {/* Top National Identity / Government Bar */}
      <div className="bg-[#142B4A] text-white text-xs px-4 sm:px-6 py-1.5 border-b border-[#0d1e34] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#FF9933] inline-block shrink-0"></span>
          <span className="font-semibold text-slate-100 tracking-wide text-[11px] sm:text-xs">
            अखिल भारतीय तकनीकी शिक्षा परिषद • ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
          </span>
          <span className="text-slate-400 hidden md:inline">|</span>
          <span className="text-slate-300 text-[11px] hidden md:inline">
            A Statutory Body of the Government of India
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-[11px] text-slate-300 font-medium">
          <span className="hidden lg:inline bg-[#174A8B] text-white px-2 py-0.5 rounded border border-[#2563A6]">
            APH 2026-27 Portal
          </span>
          <span className="hidden sm:inline text-slate-300">
            Helpline: 011-29581000
          </span>
        </div>
      </div>

      {/* Tricolor Identity Accent Line */}
      <div className="h-[3px] w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Main Header Container */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-[#1F2937] hover:text-[#174A8B] p-1.5 rounded border border-[#D6DEE8] hover:bg-[#F1F4F8]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Institutional Seal / AICTE Emblem Graphic */}
            <div className="w-10 h-10 rounded border border-[#174A8B] bg-[#142B4A] flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
              <span className="text-[10px] font-bold tracking-tighter text-[#FF9933]">AICTE</span>
              <FileCheck className="w-4 h-4 text-white -mt-0.5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#142B4A]">
                  PRAMAN
                </span>
                <span className="text-sm font-semibold text-[#526174]">
                  • प्रमाण
                </span>
                <span className="bg-[#EBF3FA] text-[#174A8B] text-[11px] font-bold px-2 py-0.5 rounded border border-[#C5DCF2] uppercase tracking-wide">
                  Regulatory Scrutiny
                </span>
              </div>
              <p className="text-[12px] text-[#526174] hidden sm:block font-medium">
                AI-Assisted Institutional Scrutiny & Approval System (Hand-off Protocol)
              </p>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Reset Button */}
          <button
            onClick={handleResetData}
            disabled={isResetting}
            title="Reset system records to default synthetic demo state"
            className="hidden lg:flex items-center gap-1.5 text-xs text-[#1F2937] hover:text-[#174A8B] bg-white hover:bg-[#F1F4F8] px-3 py-1.5 rounded border border-[#D6DEE8] transition-colors disabled:opacity-50 font-medium"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#526174] ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Records</span>
          </button>

          {/* Active User / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-[#D6DEE8] bg-[#F8FAFC] hover:bg-[#F1F4F8] transition-all text-left"
            >
              <div className="w-7 h-7 rounded bg-[#174A8B] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-[#1F2937] flex items-center gap-1">
                  {currentUser.name}
                  <ChevronDown className="w-3.5 h-3.5 text-[#526174]" />
                </div>
                <div className="text-[11px] text-[#174A8B] font-medium">
                  {currentUser.role}
                </div>
              </div>
            </button>

            {/* Role Dropdown */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D6DEE8] rounded shadow-lg z-50 p-2 animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-[#D6DEE8] bg-[#F8FAFC] rounded-t">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#142B4A]">
                    Simulate Scrutiny Role / Persona
                  </p>
                  <p className="text-xs text-[#526174] mt-0.5">
                    Switch viewpoint to test officer decisions vs. institutional response.
                  </p>
                </div>

                <div className="space-y-1 mt-1.5">
                  {availableUsers.map(user => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setRoleMenuOpen(false);
                          showNotification(
                            'info',
                            'Role Switched',
                            `Switched active session to ${user.name} (${user.role}).`
                          );
                        }}
                        className={`w-full text-left p-2.5 rounded flex items-start gap-2.5 transition-colors ${
                          isSelected
                            ? 'bg-[#EBF3FA] border border-[#C5DCF2]'
                            : 'hover:bg-[#F1F4F8] border border-transparent'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          user.role === 'Administrator'
                            ? 'bg-[#142B4A] text-white'
                            : user.role === 'Scrutiny Officer'
                            ? 'bg-[#174A8B] text-white'
                            : 'bg-[#218653] text-white'
                        }`}>
                          {user.role === 'Administrator' && <ShieldCheck className="w-4 h-4" />}
                          {user.role === 'Scrutiny Officer' && <UserCheck className="w-4 h-4" />}
                          {user.role === 'Institution Representative' && <Building className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1F2937] truncate">
                              {user.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-[#174A8B] text-white px-1.5 py-0.5 rounded font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#174A8B] font-semibold">{user.role}</p>
                          <p className="text-[11px] text-[#526174] truncate">{user.designation}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-[#D6DEE8] text-center">
                  <span className="text-[11px] text-[#526174]">
                    AICTE National Regulatory Portal • Prototype Session
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
