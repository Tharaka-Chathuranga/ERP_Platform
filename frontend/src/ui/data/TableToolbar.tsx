import { ActionIcon, Badge, Button, Group, Pill, Popover, Select, Stack, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import dayjs from "dayjs";
import { SearchInput } from "./SearchInput";

export interface ToolbarFilterOption {
  label: string;
  value: string;
}

export type ToolbarFilterConfig =
  | {
      type?: "select";
      label: string;
      value: string;
      onChange: (value: string) => void;
      options: ToolbarFilterOption[];
    }
  | {
      type: "daterange";
      label: string;
      value: [Date | null, Date | null];
      onChange: (value: [Date | null, Date | null]) => void;
    };

interface TableToolbarProps {
  filters?: ToolbarFilterConfig[];
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  searchPosition?: "left" | "right";
  actions?: ReactNode;
  leftSection?: ReactNode;
}

export function TableToolbar({ filters, search, searchPosition = "left", actions, leftSection }: TableToolbarProps) {
  const [opened, setOpened] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<(string | [Date | null, Date | null])[]>(
    (filters ?? []).map((f) => {
      if (f.type === "daterange") return f.value;
      return f.value;
    }),
  );

  const activeCount = (filters ?? []).filter((f) => {
    if (f.type === "daterange") return f.value[0] != null || f.value[1] != null;
    return f.value !== (f.options[0]?.value ?? "");
  }).length;

  const handleOpen = () => {
    setPendingFilters(
      (filters ?? []).map((f) => {
        if (f.type === "daterange") return f.value;
        return f.value;
      }),
    );
    setOpened(true);
  };

  const handleApply = () => {
    (filters ?? []).forEach((f, i) => {
      if (f.type === "daterange") {
        f.onChange((pendingFilters[i] as [Date | null, Date | null]) ?? [null, null]);
      } else {
        f.onChange((pendingFilters[i] as string) ?? f.options[0]?.value ?? "");
      }
    });
    setOpened(false);
  };

  const handleResetAll = () => {
    setPendingFilters(
      (filters ?? []).map((f) =>
        f.type === "daterange"
          ? ([null, null] as [Date | null, Date | null])
          : (f.options[0]?.value ?? ""),
      ),
    );
  };

  const setPendingFilterAt = (index: number, value: string | [Date | null, Date | null]) => {
    setPendingFilters((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const hasFilterPanel = filters && filters.length > 0;

  const activeChips = (filters ?? [])
    .map((f) => {
      if (f.type === "daterange") {
        const [from, to] = f.value;
        if (!from && !to) return null;
        const fromStr = from ? dayjs(from).format("MMM D") : "…";
        const toStr = to ? dayjs(to).format("MMM D") : "…";
        return {
          key: f.label,
          label: `${f.label}: ${fromStr} – ${toStr}`,
          onRemove: () => f.onChange([null, null]),
        };
      }
      if (f.value === (f.options[0]?.value ?? "")) return null;
      const selectedLabel = f.options.find((o) => o.value === f.value)?.label ?? f.value;
      return {
        key: f.label,
        label: `${f.label}: ${selectedLabel}`,
        onRemove: () => f.onChange(f.options[0]?.value ?? ""),
      };
    })
    .filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const searchNode = search && (
    <SearchInput value={search.value} onChange={search.onChange} placeholder={search.placeholder} />
  );

  return (
    <Group justify="space-between" mb="md" gap="sm" wrap="wrap">
      <Group gap="sm">
        {leftSection}
        {searchPosition === "left" && searchNode}
      </Group>
      <Group gap="xs">
        {searchPosition === "right" && searchNode}
        {activeChips.map((chip) => (
          <Pill key={chip.key} size="sm" withRemoveButton onRemove={chip.onRemove}>
            {chip.label}
          </Pill>
        ))}
        {hasFilterPanel && (
          <Popover
            opened={opened}
            onClose={() => setOpened(false)}
            position="bottom-end"
            offset={6}
            shadow="md"
            radius="md"
            withArrow
            arrowPosition="side"
          >
            <Popover.Target>
              <Button
                variant={activeCount > 0 ? "light" : "default"}
                leftSection={<IconAdjustmentsHorizontal size={16} />}
                onClick={handleOpen}
                rightSection={
                  activeCount > 0 ? (
                    <Badge size="xs" circle>
                      {activeCount}
                    </Badge>
                  ) : undefined
                }
              >
                Filter
              </Button>
            </Popover.Target>

            <Popover.Dropdown w={300} p="md">
              <Stack gap={0}>
                <Group justify="space-between" mb="md">
                  <Text fw={700} size="sm">
                    Filter
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => setOpened(false)}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>

                {(filters ?? []).map((f, i) => {
                  if (f.type === "daterange") {
                    const pendingDate = (pendingFilters[i] ?? [null, null]) as [
                      Date | null,
                      Date | null,
                    ];
                    const hasActive = pendingDate[0] != null || pendingDate[1] != null;
                    return (
                      <div key={f.label}>
                        <Group justify="space-between" mb="xs">
                          <Text fw={600} size="sm">
                            {f.label}
                          </Text>
                          {hasActive && (
                            <ActionIcon
                              variant="transparent"
                              color="gray"
                              size="xs"
                              onClick={() => setPendingFilterAt(i, [null, null])}
                            >
                              <IconX size={12} />
                            </ActionIcon>
                          )}
                        </Group>
                        <DatePickerInput
                          type="range"
                          value={pendingDate}
                          onChange={(v) => setPendingFilterAt(i, v)}
                          clearable
                          mb="md"
                          size="sm"
                        />
                      </div>
                    );
                  }

                  const pendingStr = (pendingFilters[i] ?? f.value) as string;
                  const isNonDefault = pendingStr !== (f.options[0]?.value ?? "");
                  return (
                    <div key={f.label}>
                      <Text fw={600} size="sm" mb="xs">
                        {f.label}
                      </Text>
                      <Select
                        value={pendingStr}
                        onChange={(v) => v && setPendingFilterAt(i, v)}
                        data={f.options}
                        allowDeselect={false}
                        mb="md"
                        size="sm"
                        rightSection={
                          isNonDefault ? (
                            <ActionIcon
                              variant="transparent"
                              color="gray"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingFilterAt(i, f.options[0]?.value ?? "");
                              }}
                            >
                              <IconX size={12} />
                            </ActionIcon>
                          ) : undefined
                        }
                        rightSectionPointerEvents={isNonDefault ? "auto" : "none"}
                      />
                    </div>
                  );
                })}

                <Group justify="space-between" mt="md">
                  <Button size="sm" variant="default" onClick={handleResetAll}>
                    Reset all
                  </Button>
                  <Button size="sm" onClick={handleApply}>
                    Apply now
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
        {actions}
      </Group>
    </Group>
  );
}
