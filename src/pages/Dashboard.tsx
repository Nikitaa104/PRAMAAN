import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { SystemStats, ApplicationItem, AuditEvent } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FolderArchive,
  AlertOctagon,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  Plus,
  RefreshCw,
  ExternalLink,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentApps, setRecentApps] = useState<ApplicationItem[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, appsData, auditsData] = await Promise.all([
        api.getStats(),
        api.getApplications({ limit: 5 }),
        api.getAuditTrail(),
      ]);
      setStats(statsData);
      setRecentApps(appsData.data);
      setRecentAudits(auditsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Institutional semantic color mapping for status distribution
  const getSemanticColor = (status: string) => {
    if (status.includes('Submitted') || status.includes('Processing')) return '#2563A6'; // Secondary blue
    if (status.includes('Preliminary')) return '#174A8B'; // Primary blue
    if (status.includes('Human Review')) return '#B7791F'; // Warning amber
    if (status.includes('Clarification')) return '#C0393B'; // Deficiency red
    if (status.includes('Completed')) return '#218653'; // Success green
    return '#526174';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#174A8B] animate-spin" />
          <p className="text-sm text-[#1F2937] font-semibold">Loading Institutional Scrutiny Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header / Action Bar */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
              Academic Year 2026-27
            </span>
            <span className="text-xs text-[#D6DEE8]">|</span>
            <span className="text-[12px] text-[#526174] font-medium">
              National Approval Process Handbook (APH) Scrutiny
            </span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight leading-snug">
            Institutional Scrutiny Operations Dashboard
          </h1>
          <p className="text-sm text-[#526174] mt-0.5">
            Active Scrutiny Session: <strong className="text-[#1F2937]">{currentUser.name}</strong> ({currentUser.role}). Real-time dossiers, AI-extracted evidence, and statutory deficiency notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/applications?action=new')}
            className="inline-flex items-center gap-2 bg-white hover:bg-[#F1F4F8] text-[#1F2937] text-sm font-semibold px-3.5 py-2 rounded-md border border-[#D6DEE8] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#526174]" />
            <span>New Application</span>
          </button>
          <button
            onClick={() => navigate('/scrutiny/app_01')}
            className="inline-flex items-center gap-2 bg-[#174A8B] hover:bg-[#123B70] text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Start Scrutiny Workspace</span>
          </button>
        </div>
      </div>

      {/* 8 KPI Cards (4 Columns on Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Total Dossiers */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#174A8B] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Total Dossiers</span>
            <FileSpreadsheet className="w-4 h-4 text-[#174A8B]" />
          </div>
          <div className="text-[28px] font-bold text-[#1F2937] font-mono my-1 leading-tight">
            {stats?.totalApplications || 0}
          </div>
          <p className="text-xs text-[#526174]">All active institutional applications</p>
        </div>

        {/* 2. Awaiting Scrutiny */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#174A8B] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Awaiting Scrutiny</span>
            <Clock className="w-4 h-4 text-[#2563A6]" />
          </div>
          <div className="text-[28px] font-bold text-[#2563A6] font-mono my-1 leading-tight">
            {stats?.awaitingScrutiny || 0}
          </div>
          <p className="text-xs text-[#526174]">Submitted or in document intake</p>
        </div>

        {/* 3. Clarification Hold */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#B7791F] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Clarification Hold</span>
            <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
          </div>
          <div className="text-[28px] font-bold text-[#B7791F] font-mono my-1 leading-tight">
            {stats?.clarificationRequired || 0}
          </div>
          <p className="text-xs text-[#526174]">Pending institutional response</p>
        </div>

        {/* 4. Under Human Review */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#174A8B] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Under Human Review</span>
            <AlertOctagon className="w-4 h-4 text-[#174A8B]" />
          </div>
          <div className="text-[28px] font-bold text-[#142B4A] font-mono my-1 leading-tight">
            {stats?.underHumanReview || 0}
          </div>
          <p className="text-xs text-[#526174]">Officer evaluation in progress</p>
        </div>

        {/* 5. Scrutiny Completed */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#218653] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Scrutiny Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#218653]" />
          </div>
          <div className="text-[28px] font-bold text-[#218653] font-mono my-1 leading-tight">
            {stats?.completedScrutiny || 0}
          </div>
          <p className="text-xs text-[#526174]">Preliminary review finalized</p>
        </div>

        {/* 6. Documents Processed */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#174A8B] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Documents Processed</span>
            <FolderArchive className="w-4 h-4 text-[#174A8B]" />
          </div>
          <div className="text-[28px] font-bold text-[#1F2937] font-mono my-1 leading-tight">
            {stats?.documentsProcessed || 0}
          </div>
          <p className="text-xs text-[#526174]">SHA-256 hashed & verified</p>
        </div>

        {/* 7. Deficiencies Flagged */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#C0393B] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Deficiencies Flagged</span>
            <AlertOctagon className="w-4 h-4 text-[#C0393B]" />
          </div>
          <div className="text-[28px] font-bold text-[#C0393B] font-mono my-1 leading-tight">
            {stats?.complianceDeficiencies || 0}
          </div>
          <p className="text-xs text-[#526174]">Non-compliant rule checkpoints</p>
        </div>

        {/* 8. Awaiting Verification */}
        <div className="bg-white p-4 rounded-md border border-[#D6DEE8] flex flex-col justify-between hover:border-[#174A8B] transition-colors">
          <div className="flex items-center justify-between text-[#526174]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#526174]">Awaiting Verification</span>
            <ShieldCheck className="w-4 h-4 text-[#174A8B]" />
          </div>
          <div className="text-[28px] font-bold text-[#142B4A] font-mono my-1 leading-tight">
            {stats?.itemsAwaitingVerification || 0}
          </div>
          <p className="text-xs text-[#526174]">External registry checks</p>
        </div>
      </div>

      {/* Visualizations Section (3 Balanced Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Status Distribution */}
        <div className="bg-white p-4 sm:p-5 rounded-md border border-[#D6DEE8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#D6DEE8]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Application Status Distribution</h3>
                <p className="text-xs text-[#526174]">Dossiers by current regulatory stage</p>
              </div>
              <span className="text-xs font-semibold text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
                AY 2026-27
              </span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusDistribution || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={74}
                    paddingAngle={3}
                  >
                    {(stats?.statusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSemanticColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Applications`, name]}
                    contentStyle={{
                      backgroundColor: '#142B4A',
                      borderColor: '#174A8B',
                      color: '#ffffff',
                      fontSize: '12px',
                      borderRadius: '4px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#D6DEE8] text-xs">
            {(stats?.statusDistribution || []).map(item => (
              <div key={item.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: getSemanticColor(item.status) }}
                />
                <span className="text-[#526174] truncate font-medium">{item.status}</span>
                <span className="font-bold text-[#1F2937] ml-auto font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Weekly Trend */}
        <div className="bg-white p-4 sm:p-5 rounded-md border border-[#D6DEE8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#D6DEE8]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Weekly Scrutiny Velocity</h3>
                <p className="text-xs text-[#526174]">Throughput vs. deficiency detection</p>
              </div>
              <span className="text-xs font-medium text-[#526174] font-mono">30-Day Run</span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.weeklyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EBF2" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#526174' }} stroke="#D6DEE8" />
                  <YAxis tick={{ fontSize: 11, fill: '#526174' }} stroke="#D6DEE8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#142B4A',
                      borderColor: '#174A8B',
                      color: '#ffffff',
                      fontSize: '12px',
                      borderRadius: '4px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="processed"
                    name="Dossiers Processed"
                    stroke="#174A8B"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#174A8B' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deficiencies"
                    name="Deficiencies Flagged"
                    stroke="#C0393B"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#C0393B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-[#D6DEE8] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-[#174A8B] rounded"></span>
              <span className="text-[#1F2937] font-medium">Dossiers Processed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 bg-[#C0393B] rounded"></span>
              <span className="text-[#1F2937] font-medium">Deficiencies Flagged</span>
            </div>
          </div>
        </div>

        {/* 3. Top Flagged Regulatory Deficiencies */}
        <div className="bg-white p-4 sm:p-5 rounded-md border border-[#D6DEE8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#D6DEE8]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Top Regulatory Deficiencies</h3>
                <p className="text-xs text-[#526174]">APH rule non-compliance frequency</p>
              </div>
              <span className="text-xs font-medium text-[#526174] font-mono">By Clause</span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.topDeficiencyCategories || []}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EBF2" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#526174' }} stroke="#D6DEE8" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={115}
                    tick={{ fontSize: 11, fill: '#1F2937' }}
                    stroke="#D6DEE8"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#142B4A',
                      borderColor: '#174A8B',
                      color: '#ffffff',
                      fontSize: '12px',
                      borderRadius: '4px',
                    }}
                  />
                  <Bar dataKey="count" name="Deficiency Count" fill="#174A8B" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-xs text-[#526174] pt-3 border-t border-[#D6DEE8] leading-relaxed">
            Note: Fire safety certificates & land title demarcation account for 60%+ of active scrutiny holds.
          </p>
        </div>
      </div>

      {/* 2-Column Section: Recent Applications & Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Applications Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-md border border-[#D6DEE8] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:px-5 border-b border-[#D6DEE8] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Recent Institutional Dossiers</h3>
                <p className="text-xs text-[#526174]">Applications currently progressing through scrutiny queue</p>
              </div>
              <button
                onClick={() => navigate('/applications')}
                className="text-xs text-[#174A8B] hover:text-[#123B70] font-bold flex items-center gap-1 transition-colors"
              >
                <span>View All Applications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] text-[#1F2937] text-xs font-bold uppercase tracking-wider border-b border-[#D6DEE8]">
                  <tr>
                    <th className="py-2.5 px-4">Application ID</th>
                    <th className="py-2.5 px-4">Institution Name & Location</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF2]">
                  {recentApps.map(app => (
                    <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#174A8B]">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1F2937]">{app.institution.name}</div>
                        <div className="text-xs text-[#526174] flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-[#526174]" />
                          <span>{app.institution.district}, {app.institution.state}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#526174] text-xs font-medium">{app.category}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className="text-[#1F2937] hover:text-[#174A8B] bg-white hover:bg-[#F1F4F8] border border-[#D6DEE8] px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => navigate(`/scrutiny/${app.id}`)}
                            className="text-white bg-[#174A8B] hover:bg-[#123B70] px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>Scrutiny</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] border-t border-[#D6DEE8] text-xs text-[#526174] flex items-center justify-between">
            <span>Showing top 5 active institutional dossiers</span>
            <span className="font-medium text-[#174A8B]">APH Scrutiny Norms Enforced</span>
          </div>
        </div>

        {/* Recent Audit Events Stream (1 Col) */}
        <div className="bg-white rounded-md border border-[#D6DEE8] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#D6DEE8]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Regulatory Audit Stream</h3>
                <p className="text-xs text-[#526174]">Immutable record of officer decisions</p>
              </div>
              <button
                onClick={() => navigate('/audit-trail')}
                className="text-xs text-[#174A8B] hover:text-[#123B70] font-bold flex items-center gap-1"
              >
                <span>Full Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAudits.map(event => (
                <div key={event.id} className="text-xs p-2.5 rounded bg-[#F8FAFC] border border-[#D6DEE8]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F2937]">{event.actorName}</span>
                    <span className="text-[11px] text-[#526174] font-mono">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#174A8B] mt-0.5">
                    {event.action}
                  </div>
                  <p className="text-xs text-[#526174] mt-1 line-clamp-2 leading-relaxed">
                    {event.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#D6DEE8] text-center">
            <span className="text-[11px] text-[#526174] font-medium">
              Statutory audit logs sealed with SHA-256 cryptographic verification
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
