import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  ApplicationItem,
  DocumentItem,
  ExtractedField,
  ComplianceFinding,
  AnomalyItem,
  DocumentCategory,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  ScanEye,
  FileText,
  Upload,
  Play,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Edit2,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Hash,
  Download,
  Info,
  Layers,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

export const ScrutinyWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  // All applications for dropdown selector
  const [allApps, setAllApps] = useState<ApplicationItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>(id || 'app_01');
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Scrutiny actions loading states
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Affiliation & Land Title');

  // Field Correction inline editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldCorrectionValue, setFieldCorrectionValue] = useState('');
  const [savingField, setSavingField] = useState(false);

  // Right-hand tab
  const [rightTab, setRightTab] = useState<'fields' | 'compliance' | 'anomalies'>('fields');

  // Load all applications list
  useEffect(() => {
    api.getApplications({ limit: 50 }).then(res => {
      setAllApps(res.data);
      if (!id && res.data.length > 0) {
        setSelectedAppId(res.data[0].id);
      }
    });
  }, [id]);

  // Load selected application details
  const loadApp = async (appId: string) => {
    setLoading(true);
    try {
      const data = await api.getApplicationById(appId);
      setApplication(data);
      if (data.documents.length > 0) {
        setSelectedDoc(data.documents[0]);
      } else {
        setSelectedDoc(null);
      }
    } catch (err: any) {
      showNotification('error', 'Error loading application', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAppId) {
      loadApp(selectedAppId);
    }
  }, [selectedAppId]);

  // Handle Switch Application
  const handleAppChange = (newId: string) => {
    setSelectedAppId(newId);
    navigate(`/scrutiny/${newId}`);
  };

  // Run Compliance Engine
  const handleRunCompliance = async () => {
    if (!application) return;
    setIsRunningChecks(true);
    try {
      const res = await api.runScrutiny(application.id, {
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      setApplication(res.application);
      showNotification(
        'success',
        'Scrutiny Check Complete',
        `Evaluated regulatory checks: ${res.findings.length} findings, ${res.anomalies.length} anomaly checkpoints.`
      );
      setRightTab('compliance');
    } catch (err: any) {
      showNotification('error', 'Scrutiny Execution Failed', err.message);
    } finally {
      setIsRunningChecks(false);
    }
  };

  // Upload Document
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !application) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', application.id);
      formData.append('category', uploadCategory);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('actorName', currentUser.name);
      formData.append('actorRole', currentUser.role);

      const res = await api.uploadDocument(formData);
      showNotification(
        res.duplicateDetected ? 'warning' : 'success',
        res.duplicateDetected ? 'Duplicate Hash Detected' : 'Document Ingested & Extracted',
        res.duplicateDetected
          ? 'File matches existing SHA-256 byte digest in regulatory archive!'
          : `Extracted ${res.document.fields.length} attributes using ${res.document.extractionMethod}.`
      );

      await loadApp(application.id);
      setSelectedDoc(res.document);
    } catch (err: any) {
      showNotification('error', 'Upload Failed', err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Field Correction
  const handleSaveCorrection = async (field: ExtractedField) => {
    if (!selectedDoc) return;
    setSavingField(true);
    try {
      const updated = await api.correctField(selectedDoc.id, field.id, {
        correctedValue: fieldCorrectionValue,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      // Update in local state
      field.reviewerCorrectedValue = updated.reviewerCorrectedValue;
      field.correctedBy = updated.correctedBy;
      field.isVerified = true;

      setEditingFieldId(null);
      showNotification('success', 'Field Corrected', `Updated value for '${field.fieldName}' recorded in audit log.`);
    } catch (err: any) {
      showNotification('error', 'Update Failed', err.message);
    } finally {
      setSavingField(false);
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    if (!application) return;
    try {
      const res = await api.generateReport(application.id, {
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });
      showNotification('success', 'Report Generated', `Scrutiny Dossier ${res.data.reportNumber} compiled.`);
      navigate('/reports');
    } catch (err: any) {
      showNotification('error', 'Report Generation Failed', err.message);
    }
  };

  if (loading || !application) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#174A8B] animate-spin" />
          <p className="text-sm text-[#1F2937] font-semibold">Initializing Regulatory Scrutiny Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded bg-[#174A8B] text-white flex items-center justify-center shrink-0">
            <ScanEye className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#142B4A] text-base">Regulatory Scrutiny Console</span>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#526174] mt-0.5">
              <span className="font-semibold text-[#1F2937]">Active Dossier:</span>
              <select
                value={selectedAppId}
                onChange={e => handleAppChange(e.target.value)}
                className="font-mono font-semibold text-[#1F2937] bg-[#F8FAFC] border border-[#D6DEE8] rounded px-2 py-0.5 focus:outline-none"
              >
                {allApps.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.applicationNumber} - {a.institution.name.substring(0, 36)}...
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunCompliance}
            disabled={isRunningChecks}
            className="inline-flex items-center gap-1.5 bg-[#174A8B] hover:bg-[#123B70] text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningChecks ? 'animate-spin' : ''}`} />
            <span>{isRunningChecks ? 'Evaluating APH Rules...' : 'Run Compliance Engine'}</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-1.5 bg-[#142B4A] hover:bg-[#0c1a2e] text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Compile Scrutiny Report</span>
          </button>
        </div>
      </div>

      {/* 3-Column Scrutiny Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-14rem)] min-h-[640px]">
        {/* PANEL 1: Left Document List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-md border border-[#D6DEE8] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#D6DEE8] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <h3 className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                Document Dossier ({application.documents.length})
              </h3>
              <p className="text-[11px] text-[#526174]">Select file to inspect</p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-semibold text-[#174A8B] bg-white hover:bg-[#F1F4F8] border border-[#D6DEE8] px-2.5 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3 h-3 text-[#174A8B]" />
              <span>{isUploading ? 'Ingesting...' : 'Upload'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
            />
          </div>

          {/* Category Selector for Next Upload */}
          <div className="p-2.5 bg-[#F1F4F8] border-b border-[#D6DEE8] text-xs">
            <span className="text-[10px] font-bold text-[#526174] uppercase block mb-1">
              Upload Category Preset:
            </span>
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value as DocumentCategory)}
              className="w-full text-xs py-1 px-2 border border-[#D6DEE8] rounded bg-white text-[#1F2937]"
            >
              <option value="Affiliation & Land Title">Affiliation & Land Title</option>
              <option value="Building Safety & Occupancy Certificate">Building Safety & Occupancy Certificate</option>
              <option value="Faculty & Staff Records">Faculty & Staff Records</option>
              <option value="Institutional Application Form">Institutional Application Form</option>
              <option value="Financial Audit & Balance Sheet">Financial Audit & Balance Sheet</option>
              <option value="AICTE / Statutory Council Approval">AICTE / Statutory Council Approval</option>
              <option value="Laboratory & Infrastructure Inspection">Laboratory & Infrastructure Inspection</option>
            </select>
          </div>

          {/* Document Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {application.documents.length === 0 ? (
              <div className="py-10 text-center text-[#526174] text-xs">
                No documents uploaded yet.
              </div>
            ) : (
              application.documents.map(doc => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-2.5 rounded border transition-all text-xs ${
                      isSelected
                        ? 'bg-[#EBF3FA] border-[#174A8B]'
                        : 'bg-white border-[#D6DEE8] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-bold text-[#1F2937] line-clamp-1">{doc.title}</span>
                      {doc.isDuplicateHash && (
                        <span className="shrink-0 bg-[#FDF2F2] text-[#C0393B] border border-[#F5B5B6] text-[9px] font-bold px-1.5 py-0.2 rounded">
                          HASH DUP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#526174] font-mono truncate mb-1">
                      {doc.fileName}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#526174]">{doc.category.substring(0, 22)}...</span>
                      <StatusBadge status={doc.verificationStatus} size="sm" showIcon={false} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: Center Document / Extracted Text Viewer (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-md border border-[#D6DEE8] flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Document Header & Integrity Check */}
              <div className="p-3 border-b border-[#D6DEE8] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#142B4A] truncate">{selectedDoc.title}</h4>
                  <div className="text-[11px] text-[#526174] font-mono flex items-center gap-2 mt-0.5">
                    <span>{(selectedDoc.fileSize / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="text-[#174A8B] font-bold">SHA: {selectedDoc.fileHash.substring(0, 16)}...</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] bg-white border border-[#D6DEE8] text-[#1F2937] px-2 py-0.5 rounded font-mono font-medium block">
                    {selectedDoc.extractionMethod}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash Notice */}
              <div className="p-2.5 bg-[#142B4A] text-white text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <Hash className="w-3.5 h-3.5 text-[#93C5FD] shrink-0" />
                  <span className="truncate text-slate-200">Digest: {selectedDoc.fileHash}</span>
                </div>
                {selectedDoc.isDuplicateHash ? (
                  <span className="text-[#F87171] font-bold shrink-0 ml-2">⚠️ COLLISION DETECTED</span>
                ) : (
                  <span className="text-[#4ADE80] font-medium shrink-0 ml-2">✓ UNIQUE INTEGRITY</span>
                )}
              </div>

              {/* Extracted Text & Stream Content */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs font-mono bg-[#F8FAFC]">
                <div className="bg-white p-3.5 rounded border border-[#D6DEE8]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#526174] mb-1 font-sans">
                    Document Text & OCR Stream
                  </div>
                  <div className="text-[#1F2937] leading-relaxed whitespace-pre-wrap text-xs">
                    {selectedDoc.extractedTextPreview || 'No text extracted from this document.'}
                  </div>
                </div>

                {/* Evidence Snippets Table */}
                <div className="bg-white p-3.5 rounded border border-[#D6DEE8]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#526174] mb-2 font-sans flex items-center justify-between">
                    <span>Extracted Snippets with Page Citations</span>
                    <span className="text-[#174A8B] font-bold">{selectedDoc.fields.length} attributes</span>
                  </div>

                  <div className="space-y-2">
                    {selectedDoc.fields.map(field => (
                      <div key={field.id} className="p-2.5 bg-[#F8FAFC] rounded border border-[#D6DEE8] text-xs">
                        <div className="flex items-center justify-between font-sans mb-1">
                          <span className="font-bold text-[#1F2937]">{field.fieldName}</span>
                          <span className="text-[11px] bg-white border border-[#D6DEE8] text-[#526174] px-1.5 py-0.2 rounded font-mono">
                            Page {field.pageNumber || 1}
                          </span>
                        </div>
                        <div className="text-[#526174] italic">"{field.textSnippet || field.extractedValue}"</div>
                        {field.aiObservation && (
                          <div className="mt-1.5 p-1.5 rounded bg-[#EBF3FA] border border-[#C5DCF2] text-[#174A8B] font-sans text-xs">
                            <strong className="text-[#142B4A]">AI Observation:</strong> {field.aiObservation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#526174] text-xs">
              Select a document from the left dossier to inspect extracted content
            </div>
          )}
        </div>

        {/* PANEL 3: Right Structured Fields, Compliance & Anomalies (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-md border border-[#D6DEE8] flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="p-2 bg-[#F8FAFC] border-b border-[#D6DEE8] grid grid-cols-3 gap-1 text-xs">
            <button
              onClick={() => setRightTab('fields')}
              className={`py-1.5 px-2 rounded font-bold transition-colors ${
                rightTab === 'fields'
                  ? 'bg-white text-[#174A8B] border border-[#D6DEE8]'
                  : 'text-[#526174] hover:text-[#1F2937]'
              }`}
            >
              Fields ({selectedDoc?.fields.length || 0})
            </button>
            <button
              onClick={() => setRightTab('compliance')}
              className={`py-1.5 px-2 rounded font-bold transition-colors ${
                rightTab === 'compliance'
                  ? 'bg-white text-[#174A8B] border border-[#D6DEE8]'
                  : 'text-[#526174] hover:text-[#1F2937]'
              }`}
            >
              Rules ({application.complianceFindings.length})
            </button>
            <button
              onClick={() => setRightTab('anomalies')}
              className={`py-1.5 px-2 rounded font-bold transition-colors ${
                rightTab === 'anomalies'
                  ? 'bg-white text-[#C0393B] border border-[#D6DEE8]'
                  : 'text-[#526174] hover:text-[#1F2937]'
              }`}
            >
              Anomalies ({application.anomalies.length})
            </button>
          </div>

          {/* TAB 1: Structured Fields with Reviewer Inline Correction */}
          {rightTab === 'fields' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="text-xs text-[#526174] pb-1 border-b border-[#D6DEE8] flex items-center justify-between">
                <span>Extracted attributes for active document</span>
                <span className="text-[11px] text-[#526174]">Click edit to correct</span>
              </div>

              {!selectedDoc || selectedDoc.fields.length === 0 ? (
                <div className="py-8 text-center text-[#526174] text-xs">
                  No extracted fields available.
                </div>
              ) : (
                selectedDoc.fields.map(field => {
                  const isEditing = editingFieldId === field.id;
                  return (
                    <div
                      key={field.id}
                      className="p-3 rounded border border-[#D6DEE8] bg-white hover:border-[#174A8B] transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1F2937]">{field.fieldName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono bg-[#EBF3FA] text-[#174A8B] px-1.5 py-0.2 rounded font-bold border border-[#C5DCF2]">
                            {field.confidenceScore}% conf
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingFieldId(field.id);
                                setFieldCorrectionValue(field.reviewerCorrectedValue || field.extractedValue || '');
                              }}
                              className="text-[#526174] hover:text-[#174A8B] p-1"
                              title="Correct this extracted field"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display or Edit Input */}
                      {isEditing ? (
                        <div className="space-y-2 mt-2 pt-2 border-t border-[#D6DEE8]">
                          <label className="text-[11px] font-bold text-[#142B4A] uppercase">
                            Reviewer Corrected Value:
                          </label>
                          <input
                            type="text"
                            value={fieldCorrectionValue}
                            onChange={e => setFieldCorrectionValue(e.target.value)}
                            className="w-full p-1.5 text-xs border border-[#174A8B] rounded focus:outline-none bg-white text-[#1F2937]"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingFieldId(null)}
                              className="px-2 py-1 text-xs text-[#526174] hover:text-[#1F2937]"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={savingField}
                              onClick={() => handleSaveCorrection(field)}
                              className="px-2.5 py-1 text-xs bg-[#174A8B] text-white font-semibold rounded hover:bg-[#123B70] flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save & Audit</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          {field.reviewerCorrectedValue ? (
                            <div>
                              <span className="text-[#218653] font-bold block text-sm">
                                {field.reviewerCorrectedValue} (Corrected)
                              </span>
                              <span className="text-[11px] text-[#526174] line-through">
                                Raw: {field.extractedValue}
                              </span>
                              <span className="text-[11px] text-[#218653] block">
                                Verified by {field.correctedBy}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-[#1F2937] text-sm">
                              {field.extractedValue || <span className="text-[#526174] italic">Not detected / Null</span>}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Compliance Checklist Findings */}
          {rightTab === 'compliance' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#D6DEE8] text-xs text-[#526174]">
                <span>Evaluated against APH 2026-27 rules</span>
                <button
                  onClick={handleRunCompliance}
                  className="text-[#174A8B] hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-evaluate</span>
                </button>
              </div>

              {application.complianceFindings.length === 0 ? (
                <div className="py-8 text-center text-[#526174] text-xs">
                  No compliance checks evaluated yet. Click "Run Compliance Engine" above.
                </div>
              ) : (
                application.complianceFindings.map(find => (
                  <div
                    key={find.id}
                    className={`p-3 rounded border text-xs ${
                      find.status === 'Compliant'
                        ? 'bg-[#EBF7EE] border-[#A3D9B5]'
                        : find.status === 'Non-compliant'
                        ? 'bg-[#FDF2F2] border-[#F5B5B6]'
                        : 'bg-[#FEF9ED] border-[#F8DCA0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-[#526174] block">
                          {find.ruleCode}
                        </span>
                        <span className="font-bold text-[#1F2937] text-sm">{find.ruleTitle}</span>
                      </div>
                      <StatusBadge status={find.status} size="sm" />
                    </div>

                    <p className="text-[#1F2937] mt-1 leading-relaxed text-xs">{find.explanation}</p>

                    {/* Citations */}
                    {find.evidenceSnippets.length > 0 && (
                      <div className="mt-2 p-2 bg-white rounded border border-[#D6DEE8] text-xs space-y-1">
                        <span className="font-bold text-[#526174] block">Supporting Evidentiary Citation:</span>
                        {find.evidenceSnippets.map((ev, i) => (
                          <div key={i} className="text-[#1F2937] font-mono text-[11px]">
                            • {ev.documentTitle} [P.{ev.page || 1}]: <strong>{ev.value}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-[#174A8B] font-bold">
                      <strong>Recommended Action:</strong> {find.recommendedNextAction}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Anomalies & Discrepancies */}
          {rightTab === 'anomalies' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="pb-1 border-b border-[#D6DEE8] text-xs text-[#526174]">
                Explainable anomaly checkpoints & integrity flags
              </div>

              {application.anomalies.length === 0 ? (
                <div className="py-8 text-center text-[#218653] text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-[#218653]" />
                  <span className="font-bold text-sm">Zero Anomaly Checkpoints Flagged</span>
                  <p className="text-xs text-[#526174]">All dates, names, hashes, and identifiers align across dossiers.</p>
                </div>
              ) : (
                application.anomalies.map(anom => (
                  <div
                    key={anom.id}
                    className="p-3 rounded border border-[#F5B5B6] bg-[#FDF2F2] text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-[#932729] flex items-center gap-1 text-sm">
                        <AlertOctagon className="w-3.5 h-3.5 text-[#C0393B] shrink-0" />
                        <span>{anom.title}</span>
                      </span>
                      <StatusBadge status={anom.severity} size="sm" />
                    </div>

                    <p className="text-[#1F2937] text-xs leading-relaxed">{anom.description}</p>

                    <div className="p-2 bg-white rounded border border-[#F5B5B6] text-xs font-mono text-[#1F2937]">
                      <strong>Evidence:</strong> {anom.evidence}
                    </div>

                    <div className="text-xs text-[#C0393B] font-bold">
                      Recommendation: {anom.recommendedAction}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
