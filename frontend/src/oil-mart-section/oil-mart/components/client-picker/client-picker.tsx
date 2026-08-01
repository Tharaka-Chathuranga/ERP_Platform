import { Select, type SelectProps } from "@mantine/core";
import { useMemo } from "react";
import type { OilMartClient } from "@core/types";

interface ClientPickerProps extends Omit<SelectProps, "data" | "value" | "onChange"> {
  clients: OilMartClient[];
  value: string | null;
  onChange: (clientId: string | null) => void;
}

export function ClientPicker({ clients, value, onChange, ...rest }: ClientPickerProps) {
  const data = useMemo(
    () =>
      clients
        .filter((client) => client.status === "ACTIVE")
        .map((client) => ({ value: client.id, label: `${client.code} — ${client.name}` })),
    [clients],
  );

  const selected = clients.find((client) => client.id === value);

  return (
    <Select
      data={data}
      value={value}
      onChange={onChange}
      searchable
      clearable
      nothingFoundMessage="No matching client"
      description={selected?.contactPerson ? `${selected.contactPerson} · ${selected.phone ?? "no phone"}` : undefined}
      {...rest}
    />
  );
}
