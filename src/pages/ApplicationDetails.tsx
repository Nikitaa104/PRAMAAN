import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ApplicationItem, ApplicationStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  MapPin,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  AlertOctagon,
  MessageSquare,
  History,
  ScanEye,
  FileText,
  Upload,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

const WORKFLOW_STEPS: ApplicationStatus[] = [
  'Draft',
  'Submitted',
  'Document Processing',
  'Preliminary Scrutiny',
  'Human Review',
  'Clarification Required',
  'Review Completed',
];

export const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isAdmin, isOfficer } = useAuth();
  const { showNotification } = useNotification();

  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionChoice, setDecisionChoice] = useState<'Recommended for Approval' | 'Deficiency Issued'>('Recommended for Approval');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [recordingDecision, setRecordingDecision] = useState(false);

  // Clarification / Comment
  const [newComment, setNewComment] = useState('');
  const [isClarification, setIsClarification] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const fetchApplication = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getApplicationById(id);
      setApplication(data);
    } catch (err: any) {
      showNotification('error', 'Error loading application', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !id) return;

    setRecordingDecision(true);
    try {
      const updated = await api.recordDecision(id, {
        decision: decisionChoice,
        notes: decisionNotes,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      setApplication(updated);
      setDecisionModalOpen(false);
      showNotification(
        'success',
        'Official Decision Recorded',
        `Formal scrutiny decision '${decisionChoice}' recorded for ${application.institution.name}.`
      );
    } catch (err: any) {
      showNotification('error', 'Failed to record decision', err.message);
    } finally {
      setRecordingDecision(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !newComment.trim() || !id) return;

    setPostingComment(true);
    try {
      const res = await api.addComment({
        applicationId: id,
        message: newComment.trim(),
        isClarificationRequest: isClarification,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      setNewComment('');
      setIsClarification(false);
      showNotification(
        'success',
        isClarification ? 'Clarification Issued' : 'Comment Logged',
        isClarification
          ? 'Application moved to Clarification Required status.'
          : 'Scrutiny remark logged successfully.'
      );
      fetchApplication();
    } catch (err: any) {
      showNotification('error', 'Failed to add comment', err.message);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#526174] text-sm font-semibold">Loading application dossier...</div>
      </div>
    );
  }

  const currentStepIdx = WORKFLOW_STEPS.indexOf(application.status);

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D6DEE8]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-sm font-bold text-[#174A8B] bg-[#EBF3FA] px-2.5 py-0.5 rounded border border-[#C5DCF2]">
                {application.applicationNumber}
              </span>
              <StatusBadge status={application.status} size="md" />
              <span className="text-xs text-[#526174] font-medium">
                Academic Year {application.academicYear}
              </span>
              {application.decisionStatus && (
                <span className="bg-[#EBF7EE] text-[#165834] text-xs font-bold px-2 py-0.5 rounded border border-[#A3D9B5]">
                  Determination: {application.decisionStatus}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#142B4A] mt-1">
              {application.institution.name}
            </h1>
            <p className="text-xs text-[#526174] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#526174]" />
              <span>
                {application.institution.address}, {application.institution.district}, {application.institution.state} - {application.institution.pincode}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => navigate(`/scrutiny/${application.id}`)}
              className="bg-[#174A8B] hover:bg-[#123B70] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <ScanEye className="w-4 h-4" />
              <span>Open Scrutiny Workspace</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setDecisionModalOpen(true)}
                className="bg-[#142B4A] hover:bg-[#0c1a2e] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-[#4ADE80]" />
                <span>Record Regulatory Determination</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Visual Progress Stepper */}
        <div className="pt-4">
          <div className="text-xs font-bold text-[#526174] uppercase tracking-wider mb-2.5">
            Statutory Approval Scrutiny Workflow Progression
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = application.status === step;

              return (
                <div
                  key={step}
                  className={`p-2 rounded border text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#EBF3FA] border-[#174A8B] text-[#174A8B] font-bold'
                      : isPast
                      ? 'bg-[#F8FAFC] border-[#D6DEE8] text-[#1F2937] font-medium'
                      : 'bg-white border-dashed border-[#D6DEE8] text-[#526174]'
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#526174] mb-0.5">
                    Stage {idx + 1}
                  </div>
                  <div className="truncate">{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Institutional Profile & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Institutional Profile (1 Col) */}
        <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] space-y-4">
          <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2 pb-2.5 border-b border-[#D6DEE8]">
            <Building2 className="w-4 h-4 text-[#174A8B]" />
            <span>Institutional Profile</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Institution Code</span>
              <span className="font-mono font-bold text-[#1F2937] text-sm">{application.institution.code}</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Discipline / Faculty</span>
              <span className="font-medium text-[#1F2937]">{application.institution.type}</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Approval Category</span>
              <span className="font-bold text-[#174A8B]">{application.category}</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Year Established</span>
              <span className="font-medium text-[#1F2937]">{application.institution.establishedYear}</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Authorized Signatory</span>
              <span className="font-medium text-[#1F2937]">{application.institution.authorizedSignatory}</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Contact Email</span>
              <span className="font-mono text-[#1F2937]">{application.institution.contactEmail}</span>
            </div>
            <div>
              <span className="text-[#526174] block text-[11px] font-semibold uppercase">Assigned Scrutiny Officer</span>
              <span className="font-bold text-[#1F2937]">{application.assignedOfficerName || 'Central Scrutiny Cell'}</span>
            </div>
          </div>

          {application.finalDecisionNotes && (
            <div className="p-3 rounded bg-[#EBF7EE] border border-[#A3D9B5] text-xs">
              <span className="font-bold text-[#165834] block mb-1">Formal Regulatory Determination:</span>
              <p className="text-[#165834] leading-relaxed">{application.finalDecisionNotes}</p>
              <div className="text-[11px] text-[#218653] mt-2 font-mono">
                By: {application.finalDecisionBy} • {new Date(application.finalDecisionDate || '').toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Uploaded Documents Checklist (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#D6DEE8]">
            <div>
              <h3 className="text-base font-bold text-[#142B4A]">
                Uploaded Regulatory Documents ({application.documents.length})
              </h3>
              <p className="text-xs text-[#526174]">
                Cryptographically hashed with SHA-256 integrity digests
              </p>
            </div>
            <button
              onClick={() => navigate(`/scrutiny/${application.id}`)}
              className="text-xs text-[#174A8B] hover:text-[#123B70] font-bold flex items-center gap-1"
            >
              <span>Inspect in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {application.documents.length === 0 ? (
            <div className="py-10 text-center text-[#526174] text-xs">
              No documents uploaded yet. Open Scrutiny Workspace to upload files.
            </div>
          ) : (
            <div className="space-y-2.5">
              {application.documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 rounded border border-[#D6DEE8] bg-[#F8FAFC] hover:bg-[#F1F4F8] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1F2937] text-sm">{doc.title}</span>
                      <span className="bg-white border border-[#D6DEE8] text-[#526174] px-2 py-0.2 rounded text-[11px] font-semibold">
                        {doc.category}
                      </span>
                      {doc.isDuplicateHash && (
                        <span className="bg-[#FDF2F2] text-[#C0393B] border border-[#F5B5B6] px-2 py-0.2 rounded text-[11px] font-bold">
                          Hash Duplicate Flagged
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#526174] flex items-center gap-2 font-mono">
                      <span>{doc.fileName}</span>
                      <span>•</span>
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>SHA: {doc.fileHash.substring(0, 10)}...</span>
                    </div>
                    <div className="text-xs text-[#526174]">
                      Extraction Engine: <strong className="text-[#1F2937]">{doc.extractionMethod}</strong> ({doc.fields.length} attributes extracted)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={doc.verificationStatus} size="sm" />
                    <button
                      onClick={() => navigate(`/scrutiny/${application.id}`)}
                      className="bg-white hover:bg-[#F1F4F8] text-[#174A8B] border border-[#D6DEE8] px-2.5 py-1.5 rounded text-xs font-semibold transition-colors"
                    >
                      Examine
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviewer Scrutiny Remarks & Clarification Requests */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8]">
        <h3 className="text-base font-bold text-[#142B4A] flex items-center gap-2 pb-2.5 border-b border-[#D6DEE8]">
          <MessageSquare className="w-4 h-4 text-[#174A8B]" />
          <span>Scrutiny Remarks & Institutional Clarifications</span>
        </h3>

        {/* Existing Comments Log */}
        <div className="mt-3.5 space-y-2.5">
          {application.comments.map(c => (
            <div
              key={c.id}
              className={`p-3 rounded border text-xs ${
                c.isClarificationRequest
                  ? 'bg-[#FEF9ED] border-[#F8DCA0] text-[#86540B]'
                  : 'bg-[#F8FAFC] border-[#D6DEE8] text-[#1F2937]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1F2937]">{c.authorName}</span>
                  <span className="text-[11px] text-[#526174] font-medium">({c.authorRole})</span>
                  {c.isClarificationRequest && (
                    <span className="bg-[#B7791F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                      Deficiency Notice / Clarification
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#526174] font-mono">
                  {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="leading-relaxed mt-1 text-sm">{c.message}</p>
            </div>
          ))}
        </div>

        {/* Add Remark Form */}
        <form onSubmit={handlePostComment} className="mt-4 pt-3.5 border-t border-[#D6DEE8] space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1">
              Add Scrutiny Observation / Issue Deficiency Notice
            </label>
            <textarea
              rows={3}
              required
              placeholder="Record regulatory remarks or specific clarification requirements..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full p-2.5 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-[#1F2937] cursor-pointer">
              <input
                type="checkbox"
                checked={isClarification}
                onChange={e => setIsClarification(e.target.checked)}
                className="w-4 h-4 text-[#174A8B] rounded border-[#D6DEE8]"
              />
              <span className="font-bold text-[#B7791F]">
                Mark as Official Clarification Hold (sets status to Clarification Required)
              </span>
            </label>

            <button
              type="submit"
              disabled={postingComment}
              className="bg-[#174A8B] hover:bg-[#123B70] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 self-end sm:self-auto"
            >
              {postingComment ? 'Posting...' : isClarification ? 'Issue Clarification Notice' : 'Post Remark'}
            </button>
          </div>
        </form>
      </div>

      {/* Decision Recording Modal */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c1a2e]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#D6DEE8] max-w-lg w-full p-5 sm:p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6DEE8]">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#174A8B]" />
                <h3 className="text-base font-bold text-[#142B4A]">
                  Record Formal Regulatory Determination
                </h3>
              </div>
              <button
                onClick={() => setDecisionModalOpen(false)}
                className="text-[#526174] hover:text-[#1F2937] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-3 p-3 bg-[#FEF9ED] rounded border border-[#F8DCA0] text-xs text-[#86540B] leading-relaxed">
              <strong>Statutory Decision Mandate:</strong> Only authorized human officers can record an official regulatory decision. AI findings serve solely as preliminary evidentiary support.
            </div>

            <form onSubmit={handleRecordDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  Regulatory Determination
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecisionChoice('Recommended for Approval')}
                    className={`p-3 rounded border text-xs font-bold text-left transition-colors ${
                      decisionChoice === 'Recommended for Approval'
                        ? 'bg-[#EBF7EE] border-[#218653] text-[#165834] ring-1 ring-[#218653]'
                        : 'border-[#D6DEE8] hover:bg-[#F8FAFC] text-[#1F2937]'
                    }`}
                  >
                    Recommended for Approval
                    <span className="block text-[11px] font-normal text-[#526174] mt-1">
                      All critical regulatory norms satisfied
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionChoice('Deficiency Issued')}
                    className={`p-3 rounded border text-xs font-bold text-left transition-colors ${
                      decisionChoice === 'Deficiency Issued'
                        ? 'bg-[#FDF2F2] border-[#C0393B] text-[#932729] ring-1 ring-[#C0393B]'
                        : 'border-[#D6DEE8] hover:bg-[#F8FAFC] text-[#1F2937]'
                    }`}
                  >
                    Deficiency Issued
                    <span className="block text-[11px] font-normal text-[#526174] mt-1">
                      Non-compliant checkpoints flagged
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  Official Decision Remarks & Minute Reference <span className="text-[#C0393B]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record justification, hearing date, or meeting minute reference..."
                  value={decisionNotes}
                  onChange={e => setDecisionNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D6DEE8]">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F1F4F8] border border-[#D6DEE8] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingDecision}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#0c1a2e] rounded-md transition-colors disabled:opacity-50"
                >
                  {recordingDecision ? 'Signing...' : 'Sign & Record Determination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
