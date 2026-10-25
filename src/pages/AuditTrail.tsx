import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AuditEvent } from '../types';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditTrail({
        entityType: entityFilter,
        search: searchTerm,
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [entityFilter, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#D6DEE8]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A8B] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#C5DCF2]">
            Statutory Accountability
          </span>
          <span className="text-xs text-[#D6DEE8]">|</span>
          <span className="text-[12px] text-[#526174]">Immutable Officer Action Log</span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-[#174A8B]" />
          <span>Regulatory Audit Trail & Accountability Log</span>
        </h1>
        <p className="text-sm text-[#526174] mt-0.5">
          Cryptographically referenced, immutable log of all institutional submissions, officer field corrections, compliance evaluations, and statutory decisions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-md border border-[#D6DEE8] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#526174] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-[#D6DEE8] rounded-md focus:outline-none bg-[#F8FAFC] text-[#1F2937]"
          >
            <option value="all">All Regulatory Entities</option>
            <option value="Application">Application</option>
            <option value="Document">Document</option>
            <option value="ComplianceRule">Compliance Rule</option>
            <option value="Verification">Verification Check</option>
            <option value="Report">Scrutiny Report</option>
            <option value="Setting">System Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-md border border-[#D6DEE8] overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            Loading immutable audit logs...
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-[#526174] text-xs">
            No audit events matched current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#1F2937] text-xs font-bold uppercase tracking-wider border-b border-[#D6DEE8]">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Officer / Actor</th>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Entity & Reference</th>
                  <th className="py-3 px-4">Audit Details & Traceability</th>
                  <th className="py-3 px-4">Values (Before → After)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF2]">
                {events.map(event => (
                  <tr key={event.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-[#526174] whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1F2937] text-xs">{event.actorName}</div>
                      <span className="text-[11px] text-[#174A8B] font-semibold">{event.actorRole}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1F2937]">
                      <span className="bg-[#F1F4F8] text-[#1F2937] px-2 py-0.5 rounded border border-[#D6DEE8] text-[11px]">
                        {event.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#1F2937] text-xs">{event.entityType}</span>
                      <span className="block font-mono text-[11px] text-[#526174]">{event.entityId}</span>
                    </td>
                    <td className="py-3 px-4 text-[#1F2937] leading-relaxed max-w-sm text-xs">
                      {event.details}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-[#526174]">
                      {event.beforeValue || event.afterValue ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="line-through text-[#526174]">{event.beforeValue || '—'}</span>
                          <ArrowRight className="w-3 h-3 text-[#526174]" />
                          <span className="font-bold text-[#1F2937]">{event.afterValue}</span>
                        </div>
                      ) : (
                        <span className="text-[#526174] italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
