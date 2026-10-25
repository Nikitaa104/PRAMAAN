import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  FileCheck,
  ShieldCheck,
  UserCheck,
  Building,
  ArrowRight,
  Lock,
  Info,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { switchUser, availableUsers, currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);

  const handleLogin = (userId: string) => {
    switchUser(userId);
    const u = availableUsers.find(user => user.id === userId);
    showNotification('success', 'Authentication Successful', `Logged in as ${u?.name} (${u?.role}).`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0D1C30] text-slate-100 flex flex-col justify-between font-sans">
      {/* Top National Strip */}
      <div className="bg-[#091424] text-slate-300 text-xs px-4 sm:px-8 py-2 border-b border-[#172D4D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF9933] inline-block"></span>
          <span className="font-semibold text-slate-100 text-[11px] sm:text-xs">
            अखिल भारतीय तकनीकी शिक्षा परिषद • ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Government of India Statutory Body
          </span>
        </div>
        <span className="text-[11px] text-[#93C5FD] font-mono font-semibold">
          APH 2026-27 National Portal
        </span>
      </div>

      {/* Tricolor Accent Line */}
      <div className="h-[3px] w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Main Login Container */}
      <div className="max-w-md mx-auto w-full my-auto p-4 sm:p-6">
        <div className="bg-[#142B4A] border border-[#234572] rounded-md p-6 sm:p-7 shadow-xl space-y-5">
          <div className="text-center space-y-1.5 pb-2 border-b border-[#234572]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-9 h-9 rounded bg-[#174A8B] border border-[#2563A6] text-[#FF9933] flex flex-col items-center justify-center font-bold text-xs">
                <span>AICTE</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white font-mono">
                PRAMAN • प्रमाण
              </span>
            </div>
            <h1 className="text-lg font-bold text-white">
              Institutional Scrutiny Officer Sign-In
            </h1>
            <p className="text-xs text-[#A2B7D4] leading-relaxed">
              AI-Assisted Regulatory Scrutiny & Approval System (Hand-off Protocol). Select a designated role persona to authenticate:
            </p>
          </div>

          {/* Test Account Cards */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Designated Regulatory Accounts (1-Click Login)
            </span>

            {availableUsers.map(user => {
              const isSelected = selectedUserId === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#174A8B] border-[#93C5FD] ring-1 ring-[#93C5FD]'
                      : 'bg-[#0D1C30] border-[#234572] hover:bg-[#1a375e]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 text-xs font-bold text-white ${
                      user.role === 'Administrator'
                        ? 'bg-[#142B4A] border border-[#2563A6]'
                        : user.role === 'Scrutiny Officer'
                        ? 'bg-[#2563A6] border border-[#93C5FD]'
                        : 'bg-[#218653] border border-[#4ADE80]'
                    }`}
                  >
                    {user.role === 'Administrator' && <ShieldCheck className="w-4 h-4" />}
                    {user.role === 'Scrutiny Officer' && <UserCheck className="w-4 h-4" />}
                    {user.role === 'Institution Representative' && <Building className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{user.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-[#0D1C30] text-[#93C5FD] border border-[#234572]">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A2B7D4] font-medium truncate mt-0.5">
                      {user.designation}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleLogin(selectedUserId)}
            className="w-full py-2.5 px-4 bg-[#174A8B] hover:bg-[#123B70] text-white rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-[#2563A6]"
          >
            <span>Proceed to Scrutiny Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-2.5 bg-[#0D1C30] rounded border border-[#234572] text-[11px] text-[#A2B7D4] flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
            <span>
              Decision-support prototype under AICTE Approval Process Handbook (APH 2026-27). All scrutiny determinations require authenticated officer digital signature.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-400 py-3 border-t border-[#172D4D]">
        अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE) • Institutional Regulatory Scrutiny Portal
      </div>
    </div>
  );
};
