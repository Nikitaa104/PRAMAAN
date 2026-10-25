import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DocumentItem, ApplicationItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  FolderArchive,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Hash,
  Download,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';

export const DocumentRepository: React.FC = () => {
  const [documents, setDocuments] = useState<(DocumentItem & { institutionName: string; appNumber: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<(DocumentItem & { institutionName: string; appNumber: string }) | null>(null);

  const fetchAllDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications({ limit: 100 });
      const docList: (DocumentItem & { institutionName: string; appNumber: string })[] = [];
      res.data.forEach(app => {
        app.documents.forEach(d => {
          docList.push({
            ...d,
            institutionName: app.institution.name,
            appNumber: app.applicationNumber,
          });
        });
      });
      setDocuments(docList);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocs();
  }, []);

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileHash.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
            Cryptographic Vault
          </span>
          <span className="text-xs text-[#D6DEE8]">|</span>
          <span className="text-[12px] text-[#526174]">SHA-256 Validated Evidentiary Records</span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
          <FolderArchive className="w-6 h-6 text-[#174A8B]" />
          <span>Central Regulatory Document Repository</span>
        </h1>
        <p className="text-sm text-[#526174] mt-0.5">
          Archival index of institutional registered deeds, approved building plans, Fire NOC certificates, and land title documents.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-md border border-[#D6DEE8] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#526174] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by file title, institution name, or SHA-256 hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          />
        </div>

        <div className="w-full sm:w-72">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="all">All Document Categories</option>
            <option value="Institutional Application Form">Institutional Application Form</option>
            <option value="Affiliation & Land Title">Affiliation & Land Title</option>
            <option value="Building Safety & Occupancy Certificate">Building Safety & Occupancy Certificate</option>
            <option value="Faculty & Staff Records">Faculty & Staff Records</option>
            <option value="Financial Audit & Balance Sheet">Financial Audit & Balance Sheet</option>
            <option value="AICTE / Statutory Council Approval">AICTE / Statutory Council Approval</option>
            <option value="Laboratory & Infrastructure Inspection">Laboratory & Infrastructure Inspection</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-md border border-[#D6DEE8] overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            Loading repository index...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            No matching documents found in repository.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#1F2937] text-xs font-bold uppercase tracking-wider border-b border-[#D6DEE8]">
                <tr>
                  <th className="py-3 px-4">Document Title & File</th>
                  <th className="py-3 px-4">Institution / Dossier</th>
                  <th className="py-3 px-4">Regulatory Category</th>
                  <th className="py-3 px-4">Integrity Hash (SHA-256)</th>
                  <th className="py-3 px-4">Extraction</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF2]">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1F2937] flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#174A8B] shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                      <div className="text-xs text-[#526174] font-mono mt-0.5">
                        {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1F2937] text-xs">{doc.institutionName}</div>
                      <span className="font-mono text-xs font-bold text-[#174A8B]">{doc.appNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-[#526174] text-xs">{doc.category}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[#1F2937]">{doc.fileHash.substring(0, 12)}...</span>
                        {doc.isDuplicateHash && (
                          <span className="bg-[#FDF2F2] text-[#C0393B] border border-[#F5B5B6] text-[10px] font-bold px-1.5 py-0.2 rounded">
                            COLLISION
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#F1F4F8] text-[#1F2937] text-[11px] px-2 py-0.5 rounded border border-[#D6DEE8] font-mono">
                        {doc.extractionMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.verificationStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="bg-white hover:bg-[#F1F4F8] text-[#174A8B] border border-[#D6DEE8] px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-[#0c1a2e]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#D6DEE8] max-w-2xl w-full p-5 sm:p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6DEE8]">
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">{previewDoc.title}</h3>
                <p className="text-xs text-[#526174] font-mono mt-0.5">{previewDoc.fileName}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-[#526174] hover:text-[#1F2937] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 bg-[#142B4A] text-white rounded text-xs font-mono">
                <div className="text-[10px] text-[#A2B7D4] uppercase font-bold">SHA-256 Cryptographic Hash</div>
                <div className="text-[#93C5FD] break-all mt-0.5">{previewDoc.fileHash}</div>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#D6DEE8] rounded text-xs space-y-2">
                <div className="text-[11px] font-bold text-[#142B4A] uppercase tracking-wider">
                  Extracted Regulatory Text Content
                </div>
                <div className="text-[#1F2937] font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {previewDoc.extractedTextPreview || 'No text extracted from document.'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-[#1F2937]">
                  Extracted Attributes ({previewDoc.fields.length})
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {previewDoc.fields.map(f => (
                    <div key={f.id} className="p-2 bg-[#F8FAFC] rounded border border-[#D6DEE8]">
                      <span className="text-[10px] text-[#526174] block font-semibold">{f.fieldName}</span>
                      <span className="font-bold text-[#1F2937]">{f.extractedValue || 'None'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D6DEE8]">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-[#1F2937] bg-white hover:bg-[#F1F4F8] border border-[#D6DEE8] rounded-md transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
