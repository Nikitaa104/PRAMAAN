export type UserRole = 'Administrator' | 'Scrutiny Officer' | 'Institution Representative';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  department?: string;
  institutionId?: string;
  avatar?: string;
}

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Document Processing'
  | 'Preliminary Scrutiny'
  | 'Human Review'
  | 'Clarification Required'
  | 'Resubmitted'
  | 'Review Completed';

export type InstitutionType =
  | 'Engineering & Technology'
  | 'Management'
  | 'Pharmacy'
  | 'Polytechnic / Diploma'
  | 'Architecture & Planning'
  | 'Applied Arts & Crafts';

export type ApplicationCategory =
  | 'Extension of Approval (EoA)'
  | 'New Institution Setup'
  | 'Increase in Intake'
  | 'Introduction of New Course'
  | 'Change of Site / Location';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  establishedYear: number;
  address: string;
  district: string;
  state: string;
  pincode: string;
  contactEmail: string;
  contactPhone: string;
  authorizedSignatory: string;
}

export type DocumentCategory =
  | 'Institutional Application Form'
  | 'Affiliation & Land Title'
  | 'Faculty & Staff Records'
  | 'Building Safety & Occupancy Certificate'
  | 'Financial Audit & Balance Sheet'
  | 'AICTE / Statutory Council Approval'
  | 'Laboratory & Infrastructure Inspection';

export type DocumentProcessingStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Requires OCR';

export type DocumentVerificationStatus =
  | 'Not Checked'
  | 'Pending Verification'
  | 'Verified against source'
  | 'Unable to verify'
  | 'Mismatch identified'
  | 'Requires human review';

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldName: string;
  fieldCategory: string;
  extractedValue: string | null;
  confidenceScore: number; // 0 - 100
  pageNumber?: number;
  textSnippet?: string;
  isVerified: boolean;
  reviewerCorrectedValue?: string;
  correctedBy?: string;
  correctedAt?: string;
  aiObservation?: string;
}

export interface DocumentItem {
  id: string;
  applicationId: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileHash: string; // SHA-256
  isDuplicateHash?: boolean;
  uploadedAt: string;
  uploadedBy: string;
  processingStatus: DocumentProcessingStatus;
  extractionMethod: 'Gemini 3.8 Flash' | 'Heuristic OCR Engine' | 'Manual Intake';
  extractedTextPreview?: string;
  verificationStatus: DocumentVerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  fields: ExtractedField[];
}

export type RuleSeverity = 'Mandatory' | 'High' | 'Medium' | 'Informational';

export type ComplianceStatus =
  | 'Compliant'
  | 'Non-compliant'
  | 'Needs clarification'
  | 'Unable to determine'
  | 'Pending human verification';

export interface ComplianceRule {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  regulatorySource: string;
  applicableCategories: ApplicationCategory[];
  severity: RuleSeverity;
  requiredFieldsOrDocs: string[];
  validationLogicSummary: string;
  isActive: boolean;
  version: string;
  effectiveDate: string;
}

export interface ComplianceFinding {
  id: string;
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  regulatoryReference: string;
  status: ComplianceStatus;
  severity: RuleSeverity;
  explanation: string;
  evidenceSnippets: {
    documentTitle: string;
    field: string;
    value: string;
    page?: number;
  }[];
  recommendedNextAction: string;
  reviewerDecision?: string;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  isAiObservation?: boolean;
}

export type AnomalySeverity = 'Critical' | 'Warning' | 'Low';

export interface AnomalyItem {
  id: string;
  applicationId: string;
  anomalyType:
    | 'Conflicting Identifier'
    | 'Inconsistent Dates'
    | 'Missing Mandatory Field'
    | 'Duplicate Document Hash'
    | 'Land Area Discrepancy'
    | 'Faculty Cadre Ratio Deficit'
    | 'Expired Statutory Certificate';
  title: string;
  description: string;
  involvedDocuments: string[];
  involvedFields: string[];
  severity: AnomalySeverity;
  evidence: string;
  recommendedAction: string;
  resolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string;
}

export interface VerificationRecord {
  id: string;
  applicationId: string;
  documentId: string;
  documentTitle: string;
  verificationType: 'SHA-256 Hash Duplicate Check' | 'Cross-Document Consistency' | 'Land Registry Verification' | 'Affiliation Council Record' | 'Manual Officer Inspection';
  status: DocumentVerificationStatus;
  sourceAuthority?: string;
  notes: string;
  initiatedAt: string;
  completedAt?: string;
  officerName?: string;
}

export interface ReviewComment {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  isClarificationRequest: boolean;
  clarificationStatus?: 'Open' | 'Addressed' | 'Closed';
  createdAt: string;
  attachmentName?: string;
}

export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  institutionId: string;
  institution: Institution;
  category: ApplicationCategory;
  academicYear: string;
  submittedDate: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  status: ApplicationStatus;
  documents: DocumentItem[];
  complianceFindings: ComplianceFinding[];
  anomalies: AnomalyItem[];
  comments: ReviewComment[];
  verificationRecords: VerificationRecord[];
  decisionStatus?: 'Pending Scrutiny' | 'Recommended for Approval' | 'Deficiency Issued' | 'Decision Recorded';
  finalDecisionNotes?: string;
  finalDecisionDate?: string;
  finalDecisionBy?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'Application' | 'Document' | 'ComplianceRule' | 'Verification' | 'User' | 'Report' | 'Setting';
  entityId: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress?: string;
}

export interface ScrutinyReport {
  id: string;
  reportNumber: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  category: ApplicationCategory;
  generatedAt: string;
  generatedBy: string;
  totalDocuments: number;
  verifiedDocuments: number;
  totalRulesChecked: number;
  compliantRules: number;
  deficienciesCount: number;
  anomaliesCount: number;
  executiveSummary: string;
  disclaimer: string;
}

export interface SystemStats {
  totalApplications: number;
  awaitingScrutiny: number;
  clarificationRequired: number;
  underHumanReview: number;
  completedScrutiny: number;
  documentsProcessed: number;
  complianceDeficiencies: number;
  itemsAwaitingVerification: number;
  statusDistribution: { status: string; count: number; color: string }[];
  weeklyTrends: { week: string; processed: number; deficiencies: number }[];
  topDeficiencyCategories: { category: string; count: number }[];
}
