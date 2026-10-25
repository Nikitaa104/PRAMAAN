import {
  ApplicationItem,
  ComplianceRule,
  AuditEvent,
  ScrutinyReport,
  VerificationRecord,
  ReviewComment,
  SystemStats,
  User,
  ExtractedField,
  DocumentItem,
  ComplianceFinding,
  AnomalyItem,
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Stats
  async getStats(): Promise<SystemStats> {
    const res = await fetch(`${BASE_URL}/stats`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats');
    return json.data;
  },

  // Applications
  async getApplications(params?: {
    status?: string;
    category?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ApplicationItem[]; pagination: { total: number; page: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.state) query.append('state', params.state);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${BASE_URL}/applications?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch applications');
    return { data: json.data, pagination: json.pagination };
  },

  async getApplicationById(id: string): Promise<ApplicationItem> {
    const res = await fetch(`${BASE_URL}/applications/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Application not found');
    return json.data;
  },

  async createApplication(payload: {
    institutionName: string;
    institutionType: string;
    category: string;
    state: string;
    district: string;
    academicYear: string;
    actorName: string;
    actorRole: string;
  }): Promise<ApplicationItem> {
    const res = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create application');
    return json.data;
  },

  async updateApplicationStatus(
    id: string,
    payload: { status: string; notes?: string; actorName: string; actorRole: string }
  ): Promise<ApplicationItem> {
    const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update status');
    return json.data;
  },

  async recordDecision(
    id: string,
    payload: { decision: string; notes: string; actorName: string; actorRole: string }
  ): Promise<ApplicationItem> {
    const res = await fetch(`${BASE_URL}/applications/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to record decision');
    return json.data;
  },

  // Documents
  async uploadDocument(formData: FormData): Promise<{ document: DocumentItem; duplicateDetected: boolean }> {
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to upload document');
    return { document: json.data, duplicateDetected: json.duplicateDetected };
  },

  async correctField(
    docId: string,
    fieldId: string,
    payload: { correctedValue: string; actorName: string; actorRole: string }
  ): Promise<ExtractedField> {
    const res = await fetch(`${BASE_URL}/documents/${docId}/fields/${fieldId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update field');
    return json.data;
  },

  // Scrutiny
  async runScrutiny(
    applicationId: string,
    payload: { actorName: string; actorRole: string }
  ): Promise<{ application: ApplicationItem; findings: ComplianceFinding[]; anomalies: AnomalyItem[] }> {
    const res = await fetch(`${BASE_URL}/scrutiny/${applicationId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to run scrutiny');
    return json.data;
  },

  // Compliance Rules
  async getRules(): Promise<ComplianceRule[]> {
    const res = await fetch(`${BASE_URL}/rules`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch rules');
    return json.data;
  },

  async createRule(payload: Partial<ComplianceRule> & { actorName: string; actorRole: string }): Promise<ComplianceRule> {
    const res = await fetch(`${BASE_URL}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create rule');
    return json.data;
  },

  async updateRule(
    id: string,
    payload: Partial<ComplianceRule> & { actorName: string; actorRole: string }
  ): Promise<ComplianceRule> {
    const res = await fetch(`${BASE_URL}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update rule');
    return json.data;
  },

  // Verification
  async getVerificationQueue(): Promise<(VerificationRecord & { institutionName: string; applicationNumber: string })[]> {
    const res = await fetch(`${BASE_URL}/verification`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch verification queue');
    return json.data;
  },

  async updateVerification(
    id: string,
    payload: { status: string; notes?: string; sourceAuthority?: string; actorName: string; actorRole: string }
  ): Promise<VerificationRecord> {
    const res = await fetch(`${BASE_URL}/verification/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update verification');
    return json.data;
  },

  // Comments
  async addComment(payload: {
    applicationId: string;
    message: string;
    isClarificationRequest: boolean;
    actorName: string;
    actorRole: string;
  }): Promise<{ comment: ReviewComment; updatedApplicationStatus: string }> {
    const res = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to add comment');
    return json.data;
  },

  // Reports
  async getReports(): Promise<ScrutinyReport[]> {
    const res = await fetch(`${BASE_URL}/reports`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch reports');
    return json.data;
  },

  async generateReport(
    applicationId: string,
    payload: { actorName: string; actorRole: string }
  ): Promise<{ data: ScrutinyReport; application: ApplicationItem }> {
    const res = await fetch(`${BASE_URL}/reports/${applicationId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate report');
    return json;
  },

  // Audit Trail
  async getAuditTrail(params?: { entityType?: string; search?: string }): Promise<AuditEvent[]> {
    const query = new URLSearchParams();
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/audit-trail?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch audit trail');
    return json.data;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/users`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch users');
    return json.data;
  },

  // Reset seed state
  async resetSeedData(actorName: string, actorRole: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/seed/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName, actorRole }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reset seed data');
  },
};
