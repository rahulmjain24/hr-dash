import { Badge, type BadgeTone } from './ui';
import { STATUS_LABELS, type ApplicationStatus } from '@/lib/types';

export const STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  APPLIED: 'gray',
  REVIEWING: 'blue',
  HIRED: 'green',
  REJECTED: 'red',
};

export default function StatusBadge({ status }: { status?: ApplicationStatus | null }) {
  if (!status) return <>—</>;
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
