export type UserRole = 'ADMIN' | 'MEMBER';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const DEPARTMENT_LABELS: Record<string, string> = {
  ENGINEERING: 'Engineering',
  HR: 'HR',
  SALES: 'Sales',
  FINANCE: 'Finance',
  IT: 'IT',
};

export const departmentLabel = (name?: string | null) =>
  name ? (DEPARTMENT_LABELS[name] ?? name) : '—';

export interface Department {
  id: string;
  name: string;
  description?: string | null;
}

export interface JobListing {
  id: string;
  title: string;
  description?: string | null;
  department?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean | null;
  createdAt: string;
}

export const isListingActive = (job: Pick<JobListing, 'isActive'>) => job.isActive !== false;

export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'HIRED' | 'REJECTED';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['REVIEWING'],
  REVIEWING: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
};

export interface StatusHistoryEntry {
  id: string;
  oldStatus?: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  remarks?: string | null;
  changedAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface Interview {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string | null;
  interviewer?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface Application {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  job: JobListing;
  status?: ApplicationStatus | null;
  additionalProperties?: Record<string, unknown> | null;
  submissonDate?: string | null;
  createdAt: string;
}

export type DocumentType = 'RESUME' | 'COVER_LETTER' | 'REFERENCES' | 'OTHER';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  RESUME: 'Resume',
  COVER_LETTER: 'Cover letter',
  REFERENCES: 'References',
  OTHER: 'Other',
};

export interface ApplicationDocument {
  id: string;
  documentType: DocumentType;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
