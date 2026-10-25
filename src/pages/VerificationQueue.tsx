import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { VerificationRecord, DocumentVerificationStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Edit2,
  X,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const VerificationQueue: React.FC = () => {
  const { currentUser, isOfficer, isAdmin } = useAuth();
  const { showNotification } = useNotification();

  const [queue, setQueue] = useState<(VerificationRecord & { institutionName: string; applicationNumber: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [selectedRecord, setSelectedRecord] = useState<(VerificationRecord & { institutionName: string; applicationNumber: string }) | null>(null);
  const [statusChoice, setStatusChoice] = useState<DocumentVerificationStatus>('Verified against source');
  const [sourceAuthority, setSourceAuthority] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getVerificationQueue();
      setQueue(data);
    } catch (err: any) {
      showNotification('error', 'Error loading verification queue', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenAction = (rec: VerificationRecord & { institutionName: string; applicationNumber: string }) => {
    setSelectedRecord(rec);
    setStatusChoice(rec.status);
    setSourceAuthority(rec.sourceAuthority || 'State Sub-Registrar / Municipal Fire Record');
    setNotes(rec.notes || '');
  };

  const handleSaveVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setUpdating(true);
    try {
      const updated = await api.updateVerification(selectedRecord.id, {
        status: statusChoice,
        sourceAuthority,
        notes,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      showNotification('success', 'Verification Recorded', `Status updated to '${statusChoice}' for ${selectedRecord.documentTitle}.`);
      setSelectedRecord(null);
      fetchQueue();
    } catch (err: any) {
      showNotification('error', 'Update Failed', err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
            Evidence Counter-Verification
          </span>
          <span className="text-xs text-[#D6DEE8]">|</span>
          <span className="text-[12px] text-[#526174]">Official External Registry Cross-Referencing</span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#174A8B]" />
          <span>Document Verification & Provenance Queue</span>
        </h1>
        <p className="text-sm text-[#526174] mt-0.5">
          Scrutiny checkpoint for cross-document consistency checks, cryptographic SHA-256 duplicate alerts, and statutory registry confirmations.
        </p>
      </div>

      {/* Mandatory Verification Warning Banner */}
      <div className="bg-[#FEF9ED] border border-[#F8DCA0] rounded-md p-4 flex items-start gap-3 text-xs text-[#86540B]">
        <Info className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-[#86540B]">Provenance & Authenticity Statutory Guardrail</h4>
          <p className="leading-relaxed text-xs text-[#86540B]">
            A matching cryptographic file hash only establishes that two files have identical byte streams; it does not confirm physical authenticity or legal validity. When official state APIs are unavailable, PRAMAN records "External verification unavailable" and mandates authorized scrutiny officer counter-verification.
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-md border border-[#D6DEE8] overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            Loading verification checkpoints...
          </div>
        ) : queue.length === 0 ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            No verification checkpoints currently queued.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#1F2937] text-xs font-bold uppercase tracking-wider border-b border-[#D6DEE8]">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Institution / Dossier</th>
                  <th className="py-3 px-4">Verification Check Type</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Scrutiny Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF2]">
                {queue.map(rec => (
                  <tr key={rec.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1F2937]">
                      {rec.documentTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#1F2937] font-semibold text-xs">{rec.institutionName}</div>
                      <span className="font-mono text-xs font-bold text-[#174A8B]">{rec.applicationNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#F1F4F8] text-[#1F2937] border border-[#D6DEE8] px-2 py-0.5 rounded font-mono text-xs">
                        {rec.verificationType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-[#526174] text-xs max-w-xs leading-relaxed">
                      {rec.notes || 'Awaiting counter-verification.'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(isOfficer || isAdmin) && (
                        <button
                          onClick={() => handleOpenAction(rec)}
                          className="bg-white hover:bg-[#F1F4F8] text-[#174A8B] border border-[#D6DEE8] px-2.5 py-1 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Record Result</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Result Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-[#0c1a2e]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#D6DEE8] max-w-lg w-full p-5 sm:p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6DEE8]">
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">Record Verification Result</h3>
                <p className="text-xs text-[#526174] font-mono mt-0.5">{selectedRecord.documentTitle}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#526174] hover:text-[#1F2937] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVerification} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Verification Determination Status
                </label>
                <select
                  value={statusChoice}
                  onChange={e => setStatusChoice(e.target.value as DocumentVerificationStatus)}
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white font-medium text-[#1F2937]"
                >
                  <option value="Verified against source">Verified against source (Primary Registry/Physical Check)</option>
                  <option value="Mismatch identified">Mismatch identified (Conflicting data)</option>
                  <option value="Unable to verify">Unable to verify (External verification unavailable)</option>
                  <option value="Requires human review">Requires human review (Ambiguity flagged)</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Source Authority or Verification Mechanism
                </label>
                <input
                  type="text"
                  value={sourceAuthority}
                  onChange={e => setSourceAuthority(e.target.value)}
                  placeholder="e.g. State Sub-Registrar Office, CFO Portal, Physical Inspection"
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Detailed Verification Scrutiny Notes <span className="text-[#C0393B]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Record verification notes, registry book numbers, or mismatch details..."
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D6DEE8]">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 font-semibold text-[#1F2937] hover:bg-[#F1F4F8] border border-[#D6DEE8] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 font-semibold text-white bg-[#174A8B] hover:bg-[#123B70] rounded-md transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Confirm Verification Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
