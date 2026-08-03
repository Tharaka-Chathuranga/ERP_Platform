import { Anchor, Group, Select, Stack, Text, type SelectProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import type { OilMartClient } from "@core/types";

interface ClientPickerProps extends Omit<SelectProps, "data" | "value" | "onChange"> {
  clients: OilMartClient[];
  value: string | null;
  onChange: (clientId: string | null) => void;
  /** Enables adding a client by name when the typed name has no match. */
  onQuickAdd?: (name: string) => void;
  quickAddPending?: boolean;
}

export function ClientPicker({
  clients,
  value,
  onChange,
  onQuickAdd,
  quickAddPending,
  ...rest
}: ClientPickerProps) {
  const [search, setSearch] = useState("");

  const active = useMemo(
    () => clients.filter((client) => client.status === "ACTIVE"),
    [clients],
  );

  const data = useMemo(
    () => active.map((client) => ({ value: client.id, label: `${client.code} — ${client.name}` })),
    [active],
  );

  const selected = clients.find((client) => client.id === value);

  const typed = search.trim();
  const alreadyExists = active.some(
    (client) => client.name.toLowerCase() === typed.toLowerCase(),
  );
  const offerQuickAdd = Boolean(onQuickAdd) && typed.length > 1 && !alreadyExists && !selected;

  return (
    <Stack gap={4}>
      <Select
        data={data}
        value={value}
        onChange={onChange}
        searchable
        clearable
        searchValue={search}
        onSearchChange={setSearch}
        nothingFoundMessage="No matching client"
        description={
          selected?.contactPerson
            ? `${selected.contactPerson} · ${selected.phone ?? "no phone"}`
            : undefined
        }
        {...rest}
      />

      {offerQuickAdd && (
        <Anchor
          component="button"
          type="button"
          size="xs"
          disabled={quickAddPending}
          onClick={() => onQuickAdd?.(typed)}
        >
          <Group gap={4} component="span">
            <IconPlus size={12} />
            <span>{quickAddPending ? `Adding “${typed}”…` : `Add “${typed}” as a new client`}</span>
          </Group>
        </Anchor>
      )}

      {selected?.profileIncomplete && (
        <Text size="xs" c="orange">
          This client is missing address and contact details — fill them in before sending the PDF.
        </Text>
      )}
    </Stack>
  );
}
