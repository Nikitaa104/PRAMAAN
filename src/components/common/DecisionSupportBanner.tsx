import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, CheckCircle, Search, Scale } from 'lucide-react';

export const DecisionSupportBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#10243E] text-slate-100 border-b border-[#1b3558] px-4 sm:px-6 py-2 text-xs">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#B7791F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
            Statutory Notice
          </span>
          <span className="text-slate-300 font-medium text-[12px] leading-snug">
            Automated scrutiny observations provide evidentiary assistance under AICTE APH 2026-27 guidelines. Final regulatory decisions rest exclusively with appointed scrutiny officers.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#93C5FD] hover:text-white flex items-center gap-1 font-semibold transition-colors text-[11px] shrink-0 self-end md:self-center"
        >
          <span>Evidence Protocol & Workflow</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-[1600px] mx-auto mt-2.5 pt-2.5 border-t border-[#1e3c66] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#142B4A] p-3 rounded border border-[#234572]">
            <div className="font-semibold text-[#4ADE80] flex items-center gap-1.5 mb-1 text-[12px]">
              <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" />
              Primary Source Verification
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Records corroborated against state land registries, Fire Services approvals, and issuing authorities.
            </p>
          </div>

          <div className="bg-[#142B4A] p-3 rounded border border-[#234572]">
            <div className="font-semibold text-[#60A5FA] flex items-center gap-1.5 mb-1 text-[12px]">
              <Search className="w-3.5 h-3.5 text-[#60A5FA]" />
              AI Extracted Evidence
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Parsed via multimodal extraction with SHA-256 hash validation. Officers must confirm accuracy prior to sign-off.
            </p>
          </div>

          <div className="bg-[#142B4A] p-3 rounded border border-[#234572]">
            <div className="font-semibold text-[#FBBF24] flex items-center gap-1.5 mb-1 text-[12px]">
              <Scale className="w-3.5 h-3.5 text-[#FBBF24]" />
              APH Rule Checkpoints
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Norms verified against land area, building safety, instructional area, and faculty qualifications.
            </p>
          </div>

          <div className="bg-[#142B4A] p-3 rounded border border-[#234572]">
            <div className="font-semibold text-[#F87171] flex items-center gap-1.5 mb-1 text-[12px]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F87171]" />
              Human Officer Mandate
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              System cannot auto-reject or auto-approve an application. All determinations require authenticated digital signature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
