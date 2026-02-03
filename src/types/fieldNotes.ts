// Field notes data types from mobile assessor inspection

export type ConditionRating = 'Good' | 'Fair' | 'Poor' | null;

export type RepairStatus = 
  | 'IR'   // Immediate Repair
  | 'ST'   // Short Term
  | 'LT'   // Long Term
  | 'RM'   // Routine Maintenance
  | 'NA'   // Not Applicable
  | null;

export const REPAIR_STATUS_LABELS: Record<string, string> = {
  IR: 'Immediate Repair',
  ST: 'Short Term',
  LT: 'Long Term',
  RM: 'Routine Maintenance',
  NA: 'Not Applicable',
};

export interface FieldInspectionItem {
  id: string;
  title: string;
  typeLabel: string; // e.g., "slope type", "landscaping type", "wall materials"
  types: string[];   // e.g., ["flat", "gentle slope", "erosion"]
  condition: ConditionRating;
  repairStatus: RepairStatus;
  repairAmount: number | null;
}

export interface FieldNoteData {
  sectionId: string;
  inspector: string;
  inspectionDate: string;
  location: string;
  items: FieldInspectionItem[];
  observations: string;
  photoCount: number;
}

// Helper to format currency
export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to get condition color classes
export function getConditionClasses(condition: ConditionRating): {
  bg: string;
  text: string;
  border: string;
} {
  switch (condition) {
    case 'Good':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-50',
        border: 'border-emerald-400',
      };
    case 'Fair':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-50',
        border: 'border-amber-400',
      };
    case 'Poor':
      return {
        bg: 'bg-red-500',
        text: 'text-red-50',
        border: 'border-red-400',
      };
    default:
      return {
        bg: 'bg-zinc-600',
        text: 'text-zinc-200',
        border: 'border-zinc-500',
      };
  }
}
