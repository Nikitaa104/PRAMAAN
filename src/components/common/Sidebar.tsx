import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderArchive,
  ScanEye,
  Scale,
  ShieldCheck,
  FileText,
  History,
  Sliders,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, isAdmin, isOfficer } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true },
    { name: 'Applications', to: '/applications', icon: FileSpreadsheet },
    { name: 'Document Repository', to: '/documents', icon: FolderArchive },
    { name: 'AI Scrutiny Workspace', to: '/scrutiny', icon: ScanEye },
    { name: 'Compliance Rules', to: '/rules', icon: Scale },
    { name: 'Verification Queue', to: '/verification', icon: ShieldCheck },
    { name: 'Scrutiny Reports', to: '/reports', icon: FileText },
    { name: 'Audit Trail', to: '/audit-trail', icon: History },
    { name: 'System Settings', to: '/settings', icon: Sliders },
  ];

  const isNavActive = (itemTo: string, exact?: boolean) => {
    if (exact || itemTo === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemTo || location.pathname.startsWith(`${itemTo}/`);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0c1a2e]/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 z-40 w-[240px] h-full bg-[#142B4A] text-slate-200 flex flex-col justify-between border-r border-[#0d1e34] transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <div className="px-3 py-2 mb-1 border-b border-[#1f3b64]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Regulatory Navigation
            </span>
            <span className="text-[11px] text-[#A2B7D4] block mt-0.5">
              AICTE APH 2026-27 Module
            </span>
          </div>

          <nav className="space-y-0.5 pt-1">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = isNavActive(item.to, item.exact);
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.exact}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#174A8B] text-white font-semibold border-l-[3px] border-[#FF9933] shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-[#1a375e]'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#FF9933]' : 'text-slate-300'}`} />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Officer Card at bottom of sidebar */}
        <div className="p-3 border-t border-[#1f3b64] bg-[#0d1c31]">
          <div className="flex items-center gap-2.5 p-2 rounded bg-[#142b4a] border border-[#1f3b64]">
            <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs shrink-0 text-white ${
              isAdmin
                ? 'bg-[#174A8B]'
                : isOfficer
                ? 'bg-[#2563A6]'
                : 'bg-[#218653]'
            }`}>
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-[#A2B7D4] font-medium truncate">{currentUser.role}</p>
            </div>
          </div>
          <div className="mt-2 text-center text-[11px] text-slate-400">
            Govt. Regulatory Portal • Build 2026.4
          </div>
        </div>
      </aside>
    </>
  );
};
