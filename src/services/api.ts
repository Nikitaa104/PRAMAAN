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

/**
 * Robust JSON request wrapper that guards against HTML error pages,
 * network drops, and non-JSON responses in both dev and production.
 */
async function fetchApi<T = any>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(`Network error connecting to PRAMAN server: ${netErr.message || 'Server unreachable'}`);
  }

  const contentType = res.headers.get('content-type') || '';

  // If response is not JSON (e.g., 502, 504 from gateway, 404 HTML, Vite error), extract text gracefully
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    const cleanSnippet = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 150);
    throw new Error(
      `Server HTTP ${res.status}: ${cleanSnippet || res.statusText || 'Unexpected non-JSON response'}`
    );
  }

  let json: any;
  try {
    json = await res.json();
  } catch (parseErr: any) {
    throw new Error(`Failed to parse server JSON response: ${parseErr.message}`);
  }

  if (json && typeof json === 'object' && json.success === false) {
    throw new Error(json.error || 'Operation failed on server');
  }

  return json;
}

export const api = {
  // Stats
  async getStats(): Promise<SystemStats> {
    const json = await fetchApi<{ success: boolean; data: SystemStats }>(`${BASE_URL}/stats`);
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

    const json = await fetchApi<{
      success: boolean;
      data: ApplicationItem[];
      pagination: { total: number; page: number; totalPages: number };
    }>(`${BASE_URL}/applications?${query.toString()}`);
    return { data: json.data, pagination: json.pagination };
  },

  async getApplicationById(id: string): Promise<ApplicationItem> {
    const json = await fetchApi<{ success: boolean; data: ApplicationItem }>(`${BASE_URL}/applications/${id}`);
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
    const json = await fetchApi<{ success: boolean; data: ApplicationItem }>(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  async updateApplicationStatus(
    id: string,
    payload: { status: string; notes?: string; actorName: string; actorRole: string }
  ): Promise<ApplicationItem> {
    const json = await fetchApi<{ success: boolean; data: ApplicationItem }>(`${BASE_URL}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  async recordDecision(
    id: string,
    payload: { decision: string; notes: string; actorName: string; actorRole: string }
  ): Promise<ApplicationItem> {
    const json = await fetchApi<{ success: boolean; data: ApplicationItem }>(`${BASE_URL}/applications/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  // Documents
  async uploadDocument(formData: FormData): Promise<{ document: DocumentItem; duplicateDetected: boolean }> {
    const json = await fetchApi<{ success: boolean; data: DocumentItem; duplicateDetected: boolean }>(
      `${BASE_URL}/documents/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return { document: json.data, duplicateDetected: json.duplicateDetected };
  },

  async correctField(
    docId: string,
    fieldId: string,
    payload: { correctedValue: string; actorName: string; actorRole: string }
  ): Promise<ExtractedField> {
    const json = await fetchApi<{ success: boolean; data: ExtractedField }>(
      `${BASE_URL}/documents/${docId}/fields/${fieldId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return json.data;
  },

  // Scrutiny
  async runScrutiny(
    applicationId: string,
    payload: { actorName: string; actorRole: string }
  ): Promise<{ application: ApplicationItem; findings: ComplianceFinding[]; anomalies: AnomalyItem[] }> {
    const json = await fetchApi<{
      success: boolean;
      data: { application: ApplicationItem; findings: ComplianceFinding[]; anomalies: AnomalyItem[] };
    }>(`${BASE_URL}/scrutiny/${applicationId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  // Compliance Rules
  async getRules(): Promise<ComplianceRule[]> {
    const json = await fetchApi<{ success: boolean; data: ComplianceRule[] }>(`${BASE_URL}/rules`);
    return json.data;
  },

  async createRule(payload: Partial<ComplianceRule> & { actorName: string; actorRole: string }): Promise<ComplianceRule> {
    const json = await fetchApi<{ success: boolean; data: ComplianceRule }>(`${BASE_URL}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  async updateRule(
    id: string,
    payload: Partial<ComplianceRule> & { actorName: string; actorRole: string }
  ): Promise<ComplianceRule> {
    const json = await fetchApi<{ success: boolean; data: ComplianceRule }>(`${BASE_URL}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  // Verification
  async getVerificationQueue(): Promise<(VerificationRecord & { institutionName: string; applicationNumber: string })[]> {
    const json = await fetchApi<{
      success: boolean;
      data: (VerificationRecord & { institutionName: string; applicationNumber: string })[];
    }>(`${BASE_URL}/verification`);
    return json.data;
  },

  async updateVerification(
    id: string,
    payload: { status: string; notes?: string; sourceAuthority?: string; actorName: string; actorRole: string }
  ): Promise<VerificationRecord> {
    const json = await fetchApi<{ success: boolean; data: VerificationRecord }>(`${BASE_URL}/verification/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
    const json = await fetchApi<{
      success: boolean;
      data: { comment: ReviewComment; updatedApplicationStatus: string };
    }>(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  // Reports
  async getReports(): Promise<ScrutinyReport[]> {
    const json = await fetchApi<{ success: boolean; data: ScrutinyReport[] }>(`${BASE_URL}/reports`);
    return json.data;
  },

  async generateReport(
    applicationId: string,
    payload: { actorName: string; actorRole: string }
  ): Promise<{ data: ScrutinyReport; application: ApplicationItem }> {
    const json = await fetchApi<{
      success: boolean;
      data: ScrutinyReport;
      application: ApplicationItem;
    }>(`${BASE_URL}/reports/${applicationId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json;
  },

  // Audit Trail
  async getAuditTrail(params?: { entityType?: string; search?: string }): Promise<AuditEvent[]> {
    const query = new URLSearchParams();
    if (params?.entityType) query.append('entityType', params.entityType);
    if (params?.search) query.append('search', params.search);

    const json = await fetchApi<{ success: boolean; data: AuditEvent[] }>(
      `${BASE_URL}/audit-trail?${query.toString()}`
    );
    return json.data;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const json = await fetchApi<{ success: boolean; data: User[] }>(`${BASE_URL}/users`);
    return json.data;
  },

  // Reset seed state
  async resetSeedData(actorName: string, actorRole: string): Promise<void> {
    await fetchApi(`${BASE_URL}/seed/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName, actorRole }),
    });
  },
};
