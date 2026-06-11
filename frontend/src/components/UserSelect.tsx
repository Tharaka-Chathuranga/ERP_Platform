import { Select } from "@mantine/core";
import { useUsers } from "../hooks/useUsers";

interface UserSelectProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

/** Searchable user picker. Returns the user id. */
export function UserSelect({ value, onChange, label, placeholder, error }: UserSelectProps) {
  const { data, isLoading } = useUsers();
  const options =
    data?.map((u) => ({
      value: u.id,
      label: u.displayName ? `${u.displayName} (${u.username})` : u.username,
    })) ?? [];

  return (
    <Select
      label={label}
      placeholder={placeholder ?? "Select user"}
      searchable
      data={options}
      value={value}
      onChange={onChange}
      disabled={isLoading}
      nothingFoundMessage="No users"
      error={error}
      comboboxProps={{ withinPortal: true }}
    />
  );
}
