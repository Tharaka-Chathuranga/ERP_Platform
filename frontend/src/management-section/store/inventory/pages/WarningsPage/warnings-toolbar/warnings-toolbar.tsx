import { TableToolbar } from "@ui/data";

interface WarningsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function WarningsToolbar({ search, onSearchChange }: WarningsToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search item code or name…" }}
    />
  );
}
