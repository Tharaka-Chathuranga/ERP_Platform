import { Select } from "@mantine/core";
import { useItems } from "@core/hooks/useItems";

interface ItemSelectProps {
  value: string | null;
  onChange: (itemId: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

/** Searchable item picker backed by the items list. Returns the item id. */
export function ItemSelect({ value, onChange, label, placeholder, error }: ItemSelectProps) {
  const { data, isLoading } = useItems();
  const options =
    data?.content.map((i) => ({ value: i.id, label: `${i.itemCode} — ${i.name}` })) ?? [];

  return (
    <Select
      label={label}
      placeholder={placeholder ?? "Select item"}
      searchable
      data={options}
      value={value}
      onChange={onChange}
      disabled={isLoading}
      nothingFoundMessage="No items"
      error={error}
      comboboxProps={{ withinPortal: true }}
    />
  );
}
