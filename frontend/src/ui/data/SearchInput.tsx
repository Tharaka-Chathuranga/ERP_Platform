import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

export function SearchInput({ value, onChange, placeholder = "Search…", fullWidth }: SearchInputProps) {
  return (
    <TextInput
      leftSection={<IconSearch size={14} />}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      size="sm"
      style={fullWidth ? { width: "100%" } : { minWidth: 200, maxWidth: 300 }}
    />
  );
}
