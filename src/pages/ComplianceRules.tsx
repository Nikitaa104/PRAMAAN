import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ComplianceRule, RuleSeverity } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Scale,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const ComplianceRules: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { showNotification } = useNotification();

  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);

  // Form State
  const [ruleCode, setRuleCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [regulatorySource, setRegulatorySource] = useState('AICTE Approval Process Handbook (APH) 2026-27, Clause ');
  const [severity, setSeverity] = useState<RuleSeverity>('Mandatory');
  const [validationLogic, setValidationLogic] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await api.getRules();
      setRules(data);
    } catch (err: any) {
      showNotification('error', 'Failed to load rules', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setRuleCode(`REG-APH-${String(rules.length + 1).padStart(2, '0')}`);
    setTitle('');
    setDescription('');
    setRegulatorySource('AICTE Approval Process Handbook (APH) 2026-27, Clause ');
    setSeverity('Mandatory');
    setValidationLogic('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: ComplianceRule) => {
    setEditingRule(rule);
    setRuleCode(rule.ruleCode);
    setTitle(rule.title);
    setDescription(rule.description);
    setRegulatorySource(rule.regulatorySource);
    setSeverity(rule.severity);
    setValidationLogic(rule.validationLogicSummary);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (rule: ComplianceRule) => {
    try {
      const updated = await api.updateRule(rule.id, {
        isActive: !rule.isActive,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      setRules(prev => prev.map(r => (r.id === rule.id ? updated : r)));
      showNotification(
        'info',
        'Rule Status Changed',
        `Rule ${rule.ruleCode} marked as ${updated.isActive ? 'Active' : 'Inactive'}.`
      );
    } catch (err: any) {
      showNotification('error', 'Update Failed', err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ruleCode.trim()) {
      showNotification('warning', 'Missing Details', 'Rule code and title are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingRule) {
        const updated = await api.updateRule(editingRule.id, {
          title: title.trim(),
          description: description.trim(),
          regulatorySource: regulatorySource.trim(),
          severity,
          validationLogicSummary: validationLogic.trim(),
          actorName: currentUser.name,
          actorRole: currentUser.role,
        });
        setRules(prev => prev.map(r => (r.id === editingRule.id ? updated : r)));
        showNotification('success', 'Rule Updated', `Rule ${updated.ruleCode} saved and re-indexed.`);
      } else {
        const created = await api.createRule({
          ruleCode: ruleCode.trim(),
          title: title.trim(),
          description: description.trim(),
          regulatorySource: regulatorySource.trim(),
          severity,
          validationLogicSummary: validationLogic.trim(),
          actorName: currentUser.name,
          actorRole: currentUser.role,
        });
        setRules(prev => [created, ...prev]);
        showNotification('success', 'Rule Created', `New regulatory rule ${created.ruleCode} activated.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification('error', 'Operation Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
              Statutory Norms Index
            </span>
            <span className="text-xs text-[#D6DEE8]">|</span>
            <span className="text-[12px] text-[#526174]">AICTE APH 2026-27 Rule Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#174A8B]" />
            <span>Regulatory Compliance Checklist Rules</span>
          </h1>
          <p className="text-sm text-[#526174] mt-0.5">
            Configurable regulatory logic derived from the AICTE Approval Process Handbook (APH 2026-27). Authorized officers can define, calibrate, and toggle scrutiny parameters.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-[#174A8B] hover:bg-[#123B70] text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Compliance Rule</span>
          </button>
        )}
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-md border border-[#D6DEE8] overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            Loading compliance rules catalog...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#1F2937] text-xs font-bold uppercase tracking-wider border-b border-[#D6DEE8]">
                <tr>
                  <th className="py-3 px-4">Code & Rule Title</th>
                  <th className="py-3 px-4">Handbook Clause</th>
                  <th className="py-3 px-4">Validation Logic Summary</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF2]">
                {rules.map(rule => (
                  <tr
                    key={rule.id}
                    className={`hover:bg-[#F8FAFC] transition-colors ${!rule.isActive ? 'opacity-60 bg-[#F8FAFC]' : ''}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2] text-xs">
                          {rule.ruleCode}
                        </span>
                        <span className="font-bold text-[#1F2937] text-sm">{rule.title}</span>
                      </div>
                      <p className="text-xs text-[#526174] mt-1 max-w-md line-clamp-2 leading-relaxed">
                        {rule.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#1F2937]">
                      {rule.regulatorySource}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#526174] max-w-xs leading-relaxed">
                      {rule.validationLogicSummary || 'Standard evidence presence check'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rule.severity} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        disabled={!isAdmin}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                          rule.isActive
                            ? 'bg-[#EBF7EE] text-[#165834] border border-[#A3D9B5]'
                            : 'bg-[#F1F4F8] text-[#526174] border border-[#D6DEE8]'
                        }`}
                      >
                        {rule.isActive ? <Check className="w-3 h-3 text-[#218653]" /> : <X className="w-3 h-3 text-[#526174]" />}
                        <span>{rule.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEdit(rule)}
                          className="bg-white hover:bg-[#F1F4F8] text-[#1F2937] border border-[#D6DEE8] p-1.5 rounded transition-colors"
                          title="Edit rule parameters"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#526174]" />
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

      {/* Modal: Create or Edit Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c1a2e]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#D6DEE8] max-w-lg w-full p-5 sm:p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6DEE8]">
              <h3 className="text-base font-bold text-[#142B4A]">
                {editingRule ? `Edit Rule: ${editingRule.ruleCode}` : 'Configure New Regulatory Rule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#526174] hover:text-[#1F2937] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1F2937] mb-1">
                    Rule Identifier Code <span className="text-[#C0393B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleCode}
                    onChange={e => setRuleCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none font-mono bg-white text-[#1F2937]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1F2937] mb-1">
                    Deficiency Severity
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as RuleSeverity)}
                    className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                  >
                    <option value="Mandatory">Mandatory (Holds Approval)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Informational">Informational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Rule Title <span className="text-[#C0393B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seismic Resistance & Fire Safety NOC Renewal"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Regulatory Handbook Source Reference <span className="text-[#C0393B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AICTE APH 2026-27, Clause 5.3"
                  value={regulatorySource}
                  onChange={e => setRegulatorySource(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none font-mono bg-white text-[#1F2937]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Detailed Regulatory Mandate Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="State the regulatory threshold, validity window, or cadre requirement..."
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2937] mb-1">
                  Validation Engine Logic Summary
                </label>
                <input
                  type="text"
                  value={validationLogic}
                  onChange={e => setValidationLogic(e.target.value)}
                  placeholder="e.g. Check validity date > current academic start; check land >= 2.5 acres"
                  className="w-full px-3 py-2 border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D6DEE8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#1F2937] hover:bg-[#F1F4F8] border border-[#D6DEE8] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 font-semibold text-white bg-[#174A8B] hover:bg-[#123B70] rounded-md transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
