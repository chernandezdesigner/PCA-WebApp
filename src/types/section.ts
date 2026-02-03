// Section configuration types for dynamic form generation

export interface QuickOption {
  label: string;
  text: string;
}

export interface BaseField {
  id: string;
  label: string;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows: number;
  defaultValue?: string;
  placeholder?: string;
  quickOptions?: QuickOption[] | null;
}

export interface ConditionSelectorField extends BaseField {
  type: 'condition-selector';
  options: string[]; // e.g., ['Good', 'Fair', 'Poor']
}

export interface ConditionalField extends BaseField {
  type: 'conditional';
  condition: {
    field: string;
    value: string | string[];
  };
  showWhen: boolean;
  innerField: TextareaField | ConditionSelectorField;
}

export interface TextField extends BaseField {
  type: 'text';
  placeholder?: string;
  defaultValue?: string;
  sourceLabel?: string;
  sourcePlaceholder?: string;
  additionalFields?: { id: string; placeholder: string }[];
}

export type FieldConfig = TextareaField | ConditionSelectorField | ConditionalField | TextField;

export interface SectionConfig {
  description?: FieldConfig[];
  observations?: FieldConfig[];
  concerns?: FieldConfig[];
  recommendations?: FieldConfig[];
  // For summary-style sections that don't follow the 4-block pattern
  fields?: FieldConfig[];
  introText?: string;
}

// Form data types
export type FieldValue = string | null;

export interface FormData {
  [fieldId: string]: FieldValue;
}

export interface SectionFormData {
  description: FormData;
  observations: FormData;
  concerns: FormData;
  recommendations: FormData;
}

// Block type for iteration
export type BlockType = 'description' | 'observations' | 'concerns' | 'recommendations';

export const BLOCK_TYPES: BlockType[] = ['description', 'observations', 'concerns', 'recommendations'];

export const BLOCK_LABELS: Record<BlockType, string> = {
  description: 'Description',
  observations: 'Observations',
  concerns: 'Concerns',
  recommendations: 'Recommendations',
};
