export type FilterOption = {
  label: string;
  value: string;
};

type BaseFilterConfig = {
  key: string;
  label?: string;
  placeholder?: string;
  className?: string;
};

export type TextFilterConfig = BaseFilterConfig & {
  type: 'text';
};

export type SelectFilterConfig = BaseFilterConfig & {
  type: 'select';
  options: FilterOption[];
};

export type DateRangeFilterConfig = BaseFilterConfig & {
  type: 'date-range';
};

export type MultiSelectFilterConfig = BaseFilterConfig & {
  type: 'multiselect';
  options: FilterOption[];
};

export type FilterConfig =
  | TextFilterConfig
  | SelectFilterConfig
  | DateRangeFilterConfig
  | MultiSelectFilterConfig;
