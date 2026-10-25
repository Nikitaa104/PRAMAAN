import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react';
import {
  ApplicationStatus,
  ComplianceStatus,
  DocumentVerificationStatus,
  AnomalySeverity,
  RuleSeverity,
} from '../../types';

interface StatusBadgeProps {
  status:
    | ApplicationStatus
    | ComplianceStatus
    | DocumentVerificationStatus
    | AnomalySeverity
    | RuleSeverity
    | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showIcon = true }) => {
  let style = 'bg-[#F1F4F8] text-[#1F2937] border-[#D6DEE8]';
  let IconComponent: React.ReactNode = null;

  switch (status) {
    // Compliant / Verified
    case 'Compliant':
    case 'Verified against source':
    case 'Review Completed':
      style = 'bg-[#EBF7EE] text-[#165834] border-[#A3D9B5]';
      IconComponent = <CheckCircle className="w-3.5 h-3.5 text-[#218653]" />;
      break;

    // Non-compliant / Deficiencies
    case 'Non-compliant':
    case 'Mismatch identified':
    case 'Clarification Required':
    case 'Critical':
    case 'Mandatory':
      style = 'bg-[#FDF2F2] text-[#932729] border-[#F5B5B6]';
      IconComponent = <AlertCircle className="w-3.5 h-3.5 text-[#C0393B]" />;
      break;

    // Warnings / Clarifications / Human Review
    case 'Needs clarification':
    case 'Requires human review':
    case 'Human Review':
    case 'High':
    case 'Warning':
      style = 'bg-[#FEF9ED] text-[#86540B] border-[#F8DCA0]';
      IconComponent = <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" />;
      break;

    // Under Process / Queued
    case 'Document Processing':
    case 'Pending human verification':
    case 'Pending Verification':
    case 'Not Checked':
    case 'Submitted':
    case 'Resubmitted':
    case 'Preliminary Scrutiny':
      style = 'bg-[#EBF3FA] text-[#174A8B] border-[#B8D5F2]';
      IconComponent = <Clock className="w-3.5 h-3.5 text-[#174A8B]" />;
      break;

    // Low / Informational / Draft / Unable
    case 'Draft':
    case 'Unable to determine':
    case 'Unable to verify':
    case 'Medium':
    case 'Low':
    case 'Informational':
    default:
      style = 'bg-[#F1F4F8] text-[#526174] border-[#D6DEE8]';
      IconComponent = <HelpCircle className="w-3.5 h-3.5 text-[#526174]" />;
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-semibold tracking-tight whitespace-nowrap ${paddingClass} ${style}`}
    >
      {showIcon && IconComponent}
      <span>{status}</span>
    </span>
  );
};
