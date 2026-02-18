// Field types for dynamic form generation

export interface QuickOption {
  label: string;
  text: string;
}

// Base field properties
interface BaseField {
  id: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  helperText?: string;
}

// Textarea field
export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
  quickOptions?: QuickOption[] | null;
}

// Condition selector (Good/Fair/Poor buttons)
export interface ConditionSelectorField extends BaseField {
  type: 'condition-selector';
  options: string[];
}

// Text field (can have source fields or additional fields)
export interface TextField extends BaseField {
  type: 'text';
  sourceLabel?: string;
  sourcePlaceholder?: string;
  additionalFields?: { id: string; placeholder: string }[];
}

// Conditional field (shows based on another field's value)
export interface ConditionalField {
  id: string;
  type: 'conditional';
  condition: {
    field: string;
    value: string | string[];
    mode?: 'exact' | 'includes';
  };
  showWhen: boolean;
  innerField: TextareaField | ConditionSelectorField | TextField | RepeatingTextField | DynamicTableField;
}

// Repeating text field (multiple text inputs, optionally dynamic)
export interface RepeatingTextField extends BaseField {
  type: 'repeating-text';
  items: { id: string; placeholder: string }[];
  dynamic?: boolean;
  minItems?: number;
  itemPrefix?: string;
  itemPlaceholderTemplate?: string;
}

// Boolean select (yes/no with associated text)
export interface BooleanSelectField extends BaseField {
  type: 'boolean-select';
  options: { value: string; label: string; text: string }[];
}

// Union of all field types
export type FieldConfig = 
  | TextareaField 
  | ConditionSelectorField 
  | TextField 
  | ConditionalField
  | RepeatingTextField
  | BooleanSelectField
  | DynamicTableField;

export type FieldValue = string | null | Record<string, string>;

export type FormData = Record<string, FieldValue>;

// Block types for report sections (group1 style)
export const BLOCK_TYPES = ['description', 'observations', 'concerns', 'recommendations'] as const;
export type BlockType = typeof BLOCK_TYPES[number];
export const BLOCK_LABELS: Record<BlockType, string> = {
  description: 'Description',
  observations: 'Observations',
  concerns: 'Concerns',
  recommendations: 'Recommendations',
};

// Equipment / dynamic table field definition (for dynamic table rows)
export interface EquipmentField {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'condition-selector' | 'checkbox';
  options?: string[];
  width?: string;
}

export interface EquipmentListMode {
  id: string;
  label: string;
  fields: EquipmentField[];
}

export interface EquipmentListConfig {
  label: string;
  fields: EquipmentField[];
  modes?: EquipmentListMode[];
}

// Dynamic table field (inline within property-info sections)
export interface DynamicTableField extends BaseField {
  type: 'dynamic-table';
  columns: EquipmentField[];
}

// Section config for report-style sections (group1)
export interface SectionConfig {
  equipmentList?: EquipmentListConfig;
  description?: FieldConfig[];
  observations?: FieldConfig[];
  concerns?: FieldConfig[];
  recommendations?: FieldConfig[];
}

// Interview block template (fields without suffixed IDs)
export interface InterviewTemplate {
  fields: Omit<FieldConfig, 'id'>[];
}

// Property info config for flat field sections (group2)
export interface PropertyInfoConfig {
  introText?: string;
  fields?: FieldConfig[];
  interviewBlocks?: {
    id: string;
    fields: FieldConfig[];
  }[];
  dynamicInterviews?: boolean;
  interviewTemplate?: InterviewTemplate;
}

// Generic section that can be either type
export type AnySection = SectionConfig | PropertyInfoConfig;

// Helper to check section type
export function isSectionConfig(config: AnySection): config is SectionConfig {
  return 'description' in config || 'observations' in config || 'concerns' in config || 'recommendations' in config || 'equipmentList' in config;
}

export function isPropertyInfoConfig(config: AnySection): config is PropertyInfoConfig {
  return 'fields' in config || 'interviewBlocks' in config;
}
