export const DEPARTMENT_LABELS: Record<string, string> = {
  ENGINEERING: 'Engineering',
  HR: 'HR',
  SALES: 'Sales',
  FINANCE: 'Finance',
  IT: 'IT',
};

export const departmentLabel = (name?: string | null) =>
  name ? (DEPARTMENT_LABELS[name] ?? name) : 'Other';

export interface JobListing {
  id: string;
  title: string;
  description?: string | null;
  department?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}
