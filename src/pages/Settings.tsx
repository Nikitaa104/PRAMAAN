import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import {
  Sliders,
  RotateCcw,
  Shield,
  Bot,
  Database,
  Check,
  AlertTriangle,
  Lock,
  UserCheck,
  Building,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { showNotification } = useNotification();
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (!window.confirm('Reset all applications, documents, rules, and audit records to default synthetic demonstration seed state?')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetSeedData(currentUser.name, currentUser.role);
      showNotification('success', 'System Reset', 'All records refreshed to demonstration state.');
      window.location.reload();
    } catch (err: any) {
      showNotification('error', 'Reset Failed', err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
            System Administration
          </span>
          <span className="text-xs text-[#D6DEE8]">|</span>
          <span className="text-[12px] text-[#526174]">Role Permissions & Threshold Parameters</span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-[#174A8B]" />
          <span>User & Regulatory System Settings</span>
        </h1>
        <p className="text-sm text-[#526174] mt-0.5">
          Configure regulatory threshold parameters, role permissions, and AI extraction engine behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Regulatory Parameters (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Regulatory Thresholds */}
          <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] space-y-3.5">
            <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2 pb-2.5 border-b border-[#D6DEE8]">
              <Shield className="w-4 h-4 text-[#174A8B]" />
              <span>AICTE Approval Process Handbook (APH 2026-27) Thresholds</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded border border-[#D6DEE8]">
                <span className="font-bold text-[#1F2937] block mb-1">
                  Land Norm: Metro / Mega City
                </span>
                <span className="text-[#174A8B] font-mono font-bold text-base">2.50 Acres</span>
                <p className="text-xs text-[#526174] mt-0.5">Contiguous unencumbered parcel</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#D6DEE8]">
                <span className="font-bold text-[#1F2937] block mb-1">
                  Land Norm: Rural / Other Areas
                </span>
                <span className="text-[#174A8B] font-mono font-bold text-base">5.00 Acres</span>
                <p className="text-xs text-[#526174] mt-0.5">Sub-Registrar registered deed</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#D6DEE8]">
                <span className="font-bold text-[#1F2937] block mb-1">
                  Faculty-Student Ratio (UG Eng.)
                </span>
                <span className="text-[#174A8B] font-mono font-bold text-base">1:20.0</span>
                <p className="text-xs text-[#526174] mt-0.5">Cadre ratio 1:2:6 (Prof/Assoc/Asst)</p>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#D6DEE8]">
                <span className="font-bold text-[#1F2937] block mb-1">
                  Fire NOC Maximum Validity Age
                </span>
                <span className="text-[#174A8B] font-mono font-bold text-base">36 Months</span>
                <p className="text-xs text-[#526174] mt-0.5">Must be valid through full academic session</p>
              </div>
            </div>
          </div>

          {/* Role Access Matrix */}
          <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] space-y-3.5">
            <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2 pb-2.5 border-b border-[#D6DEE8]">
              <UserCheck className="w-4 h-4 text-[#174A8B]" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC] text-[#1F2937] font-bold uppercase tracking-wider text-[11px] border-b border-[#D6DEE8]">
                  <tr>
                    <th className="py-2.5 px-3">System Permission</th>
                    <th className="py-2.5 px-3 text-center">Administrator</th>
                    <th className="py-2.5 px-3 text-center">Scrutiny Officer</th>
                    <th className="py-2.5 px-3 text-center">Institution Rep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF2] text-xs">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937]">Create Institutional Application</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937]">Upload Regulatory Documents</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937]">Run AI Scrutiny & Correct Extracted Fields</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#526174]">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937]">Issue Deficiency / Clarification Notices</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#526174]">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937]">Configure Regulatory Compliance Checklist</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#526174]">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#526174]">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937]">Record Formal Statutory Approval Determination</td>
                    <td className="py-2.5 px-3 text-center text-[#218653] font-bold">✓</td>
                    <td className="py-2.5 px-3 text-center text-[#526174]">✗</td>
                    <td className="py-2.5 px-3 text-center text-[#526174]">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Engine & Reset (1 Col) */}
        <div className="space-y-5">
          {/* AI Extraction Engine Card */}
          <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] space-y-3 text-xs">
            <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2 pb-2 border-b border-[#D6DEE8]">
              <Bot className="w-4 h-4 text-[#174A8B]" />
              <span>AI Extraction Engine</span>
            </h3>

            <div>
              <span className="text-[#526174] block text-[11px] uppercase font-bold">Active Engine</span>
              <span className="font-mono font-bold text-[#1F2937]">gemini-3.8-flash</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] uppercase font-bold">Fallback Pipeline</span>
              <span className="font-mono text-[#1F2937]">Heuristic OCR + Deterministic Parsers</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] uppercase font-bold">Cryptographic Integrity</span>
              <span className="font-mono text-[#1F2937]">SHA-256 Digest Collision Guard</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] uppercase font-bold">Execution Protocol</span>
              <span className="text-[#218653] font-bold">Strict Decision-Support Mode</span>
            </div>

            <div className="p-2.5 bg-[#EBF3FA] rounded border border-[#C5DCF2] text-xs text-[#174A8B] mt-2">
              All Gemini API calls execute server-side via Express with zero browser key exposure.
            </div>
          </div>

          {/* Database Reset Action */}
          <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] space-y-3 text-xs">
            <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2 pb-2 border-b border-[#D6DEE8]">
              <Database className="w-4 h-4 text-[#C0393B]" />
              <span>Demonstration Reset</span>
            </h3>

            <p className="text-[#526174] leading-relaxed text-xs">
              Restore all synthetic institutional applications, uploaded documents, compliance evaluations, and audit logs to the pristine demonstration baseline.
            </p>

            <button
              onClick={handleResetData}
              disabled={resetting}
              className="w-full py-2 px-3 bg-white hover:bg-[#FDF2F2] text-[#C0393B] border border-[#F5B5B6] rounded-md font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting Records...' : 'Reset to Demo Seed Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
