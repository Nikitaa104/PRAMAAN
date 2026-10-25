import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ApplicationItem, ApplicationCategory, ApplicationStatus, InstitutionType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  ScanEye,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');

  // Form State for New Application
  const [formInstitutionName, setFormInstitutionName] = useState('');
  const [formInstitutionType, setFormInstitutionType] = useState<InstitutionType>('Engineering & Technology');
  const [formCategory, setFormCategory] = useState<ApplicationCategory>('Extension of Approval (EoA)');
  const [formState, setFormState] = useState('Maharashtra');
  const [formDistrict, setFormDistrict] = useState('Pune');
  const [formAcademicYear, setFormAcademicYear] = useState('2026-2027');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications({
        status: statusFilter,
        category: categoryFilter,
        state: stateFilter,
        search: searchTerm,
        page,
        limit: 8,
      });
      setApplications(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      showNotification('error', 'Error loading applications', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, categoryFilter, stateFilter, searchTerm, page]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInstitutionName.trim()) {
      showNotification('warning', 'Missing Details', 'Please provide the institution name.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createApplication({
        institutionName: formInstitutionName.trim(),
        institutionType: formInstitutionType,
        category: formCategory,
        state: formState,
        district: formDistrict,
        academicYear: formAcademicYear,
        actorName: currentUser.name,
        actorRole: currentUser.role,
      });

      showNotification(
        'success',
        'Application Registered',
        `Successfully generated application dossier ${created.applicationNumber}.`
      );
      setIsModalOpen(false);
      setSearchParams({});
      setFormInstitutionName('');
      fetchApplications();
      navigate(`/applications/${created.id}`);
    } catch (err: any) {
      showNotification('error', 'Creation Failed', err.message || 'Unable to register application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Title and Create Button */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
              Dossier Master Register
            </span>
            <span className="text-xs text-[#D6DEE8]">|</span>
            <span className="text-[12px] text-[#526174]">APH Approval Cycle 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#174A8B]" />
            <span>Institutional Applications</span>
          </h1>
          <p className="text-sm text-[#526174] mt-0.5">
            Master repository of technical, engineering, and management institutional dossiers submitted for statutory evaluation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#174A8B] hover:bg-[#123B70] text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Application</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-md border border-[#D6DEE8] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#526174] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, Name, State..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="all">All Scrutiny Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Document Processing">Document Processing</option>
            <option value="Preliminary Scrutiny">Preliminary Scrutiny</option>
            <option value="Human Review">Human Review</option>
            <option value="Clarification Required">Clarification Required</option>
            <option value="Review Completed">Review Completed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="all">All Approval Categories</option>
            <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
            <option value="New Institution Setup">New Institution Setup</option>
            <option value="Increase in Intake">Increase in Intake</option>
            <option value="Introduction of New Course">Introduction of New Course</option>
          </select>
        </div>

        {/* State Filter */}
        <div>
          <select
            value={stateFilter}
            onChange={e => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="all">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-md border border-[#D6DEE8] overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            Loading institutional records...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="w-10 h-10 text-[#526174] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-[#1F2937] text-sm">No applications found</h4>
            <p className="text-xs text-[#526174] mt-1">Try adjusting search parameters or clearing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#1F2937] text-xs font-bold uppercase tracking-wider border-b border-[#D6DEE8]">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Institution & Region</th>
                  <th className="py-3 px-4">Approval Category</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Scrutiny Status</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF2]">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#174A8B]">
                      {app.applicationNumber}
                      <span className="block text-[11px] text-[#526174] font-sans font-normal">
                        AY {app.academicYear}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1F2937]">{app.institution.name}</div>
                      <div className="text-xs text-[#526174] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#526174] shrink-0" />
                        <span>
                          {app.institution.district}, {app.institution.state} ({app.institution.type})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1F2937] text-xs">
                      {app.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono bg-[#F1F4F8] px-2 py-0.5 rounded text-xs text-[#1F2937] font-semibold border border-[#D6DEE8]">
                        {app.documents.length} File(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#526174]">
                      {app.assignedOfficerName || 'Central Scrutiny Cell'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="bg-white hover:bg-[#F1F4F8] text-[#1F2937] border border-[#D6DEE8] px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => navigate(`/scrutiny/${app.id}`)}
                          className="bg-[#174A8B] hover:bg-[#123B70] text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <ScanEye className="w-3.5 h-3.5" />
                          <span>Scrutiny</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#D6DEE8] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#526174]">
            <span>
              Showing Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-[#D6DEE8] bg-white hover:bg-[#F1F4F8] text-[#1F2937] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-[#D6DEE8] bg-white hover:bg-[#F1F4F8] text-[#1F2937] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Register New Application */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c1a2e]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-[#D6DEE8] max-w-lg w-full p-5 sm:p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6DEE8]">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#174A8B]" />
                <h3 className="text-base font-bold text-[#142B4A]">
                  Register Institutional Application
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSearchParams({});
                }}
                className="text-[#526174] hover:text-[#1F2937] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  Institution Legal Name <span className="text-[#C0393B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K.J. Somaiya College of Engineering"
                  value={formInstitutionName}
                  onChange={e => setFormInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Discipline / Faculty
                  </label>
                  <select
                    value={formInstitutionType}
                    onChange={e => setFormInstitutionType(e.target.value as InstitutionType)}
                    className="w-full px-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management">Management</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Polytechnic / Diploma">Polytechnic / Diploma</option>
                    <option value="Architecture & Planning">Architecture & Planning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Approval Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as ApplicationCategory)}
                    className="w-full px-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                  >
                    <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                    <option value="New Institution Setup">New Institution Setup</option>
                    <option value="Increase in Intake">Increase in Intake</option>
                    <option value="Introduction of New Course">Introduction of New Course</option>
                    <option value="Change of Site / Location">Change of Site / Location</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    State / UT
                  </label>
                  <select
                    value={formState}
                    onChange={e => setFormState(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formDistrict}
                    onChange={e => setFormDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-white text-[#1F2937]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  Academic Approval Cycle
                </label>
                <input
                  type="text"
                  value={formAcademicYear}
                  onChange={e => setFormAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none font-mono bg-white text-[#1F2937]"
                />
              </div>

              <div className="pt-3 border-t border-[#D6DEE8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F1F4F8] border border-[#D6DEE8] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#174A8B] hover:bg-[#123B70] rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Generating Dossier...' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
