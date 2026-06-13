import { Select } from "@mantine/core";
import { DEPARTMENTS } from "@core/constants/departments";

interface DepartmentSelectProps {
  value: string | null;
  onChange: (department: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

const OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

/** Searchable department picker, backed by the curated DEPARTMENTS constant. */
export function DepartmentSelect({
  value,
  onChange,
  label,
  placeholder,
  error,
}: DepartmentSelectProps) {
  return (
    <Select
      label={label}
      placeholder={placeholder ?? "Select department"}
      searchable
      data={OPTIONS}
      value={value}
      onChange={onChange}
      nothingFoundMessage="No departments"
      error={error}
      comboboxProps={{ withinPortal: true }}
    />
  );
}
