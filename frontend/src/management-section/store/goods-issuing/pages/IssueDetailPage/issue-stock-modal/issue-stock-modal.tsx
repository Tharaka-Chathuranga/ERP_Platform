import { useEffect, useState } from "react";
import { ActionIcon, Button, Card, Group, Loader, Modal, NumberInput, Select, Stack, Text } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getItem } from "@store/inventory";
import type { Location } from "@core/types";
import { notifyError, notifySuccess } from "@core/notify";
import { issueDocument, type IssueAllocationInput } from "../../../api";

interface IssueLineRow {
  lineId: string;
  itemId: string;
  label: string;
  quantity: number;
}

interface Alloc {
  general: boolean;
  rack: string;
  row: string;
  column: string;
  quantity: number | "";
}

const slotKey = (l: Pick<Location, "rack" | "row" | "column" | "general">) =>
  l.general ? "__general__" : [l.rack, l.row, l.column].join("|");
const slotText = (l: Pick<Location, "rack" | "row" | "column" | "general">) =>
  l.general ? "General" : [l.rack, l.row, l.column].filter(Boolean).join(" / ") || "(unspecified)";

interface IssueStockModalProps {
  opened: boolean;
  onClose: () => void;
  issueId: string;
  lines: IssueLineRow[];
  onDone: () => void;
}

export function IssueStockModal({ opened, onClose, issueId, lines, onDone }: IssueStockModalProps) {
  const itemIds = [...new Set(lines.map((l) => l.itemId))];
  const itemsQuery = useQuery({
    queryKey: ["issue-stock-items", issueId, itemIds],
    queryFn: () => Promise.all(itemIds.map((id) => getItem(id))),
    enabled: opened && lines.length > 0,
  });
  const locationsByItem = new Map<string, Location[]>();
  (itemsQuery.data ?? []).forEach((it) => locationsByItem.set(it.id, it.locations ?? []));

  const [allocs, setAllocs] = useState<Record<string, Alloc[]>>({});
  const lineKey = lines.map((l) => l.lineId).join(",");

  useEffect(() => {
    if (opened) {
      const init: Record<string, Alloc[]> = {};
      lines.forEach((l) => {
        init[l.lineId] = [{ general: false, rack: "", row: "", column: "", quantity: l.quantity }];
      });
      setAllocs(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, lineKey]);

  const setRow = (lineId: string, idx: number, patch: Partial<Alloc>) =>
    setAllocs((p) => ({
      ...p,
      [lineId]: (p[lineId] ?? []).map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  const addRow = (lineId: string) =>
    setAllocs((p) => ({
      ...p,
      [lineId]: [...(p[lineId] ?? []), { general: false, rack: "", row: "", column: "", quantity: "" }],
    }));
  const removeRow = (lineId: string, idx: number) =>
    setAllocs((p) => ({ ...p, [lineId]: (p[lineId] ?? []).filter((_, i) => i !== idx) }));

  const allocatedFor = (lineId: string) =>
    (allocs[lineId] ?? []).reduce((s, r) => s + Number(r.quantity || 0), 0);

  const valid = lines.every((line) => {
    const rows = allocs[line.lineId] ?? [];
    return (
      rows.length > 0 &&
      rows.every((r) => r.general || r.rack || r.row || r.column) &&
      allocatedFor(line.lineId) === line.quantity
    );
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload: IssueAllocationInput[] = lines.flatMap((line) =>
        (allocs[line.lineId] ?? []).map((r) => ({
          lineId: line.lineId,
          rack: r.general ? undefined : r.rack || undefined,
          row: r.general ? undefined : r.row || undefined,
          column: r.general ? undefined : r.column || undefined,
          quantity: Number(r.quantity || 0),
        })),
      );
      return issueDocument(issueId, payload);
    },
    onSuccess: () => {
      notifySuccess("Stock issued");
      onClose();
      onDone();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Issue stock — choose locations" centered size="lg">
      {itemsQuery.isLoading ? (
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      ) : (
        <Stack>
          {lines.map((line) => {
            const slots = (locationsByItem.get(line.itemId) ?? []).filter((l) => (l.quantity ?? 0) > 0);
            const rows = allocs[line.lineId] ?? [];
            const allocated = allocatedFor(line.lineId);
            const remaining = line.quantity - allocated;
            return (
              <Card key={line.lineId} withBorder radius="sm" padding="sm">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600}>
                    {line.label}
                  </Text>
                  <Text size="xs" c={remaining === 0 ? "green" : "red"}>
                    {allocated} / {line.quantity} allocated
                  </Text>
                </Group>
                {slots.length === 0 && (
                  <Text size="xs" c="red" mb="xs">
                    No location stock for this item — receive it into a location first.
                  </Text>
                )}
                <Stack gap="xs">
                  {rows.map((r, idx) => (
                    <Group key={idx} gap="xs" wrap="nowrap">
                      <Select
                        flex={1}
                        placeholder="Location"
                        data={slots.map((s) => ({
                          value: slotKey(s),
                          label: `${slotText(s)} (${s.quantity ?? 0} avail)`,
                        }))}
                        value={r.general || r.rack || r.row || r.column ? slotKey(r) : null}
                        onChange={(v) => {
                          const s = slots.find((x) => slotKey(x) === v);
                          setRow(line.lineId, idx, {
                            general: s?.general ?? false,
                            rack: s?.rack ?? "",
                            row: s?.row ?? "",
                            column: s?.column ?? "",
                          });
                        }}
                      />
                      <NumberInput
                        w={110}
                        min={0}
                        placeholder="Qty"
                        value={r.quantity}
                        onChange={(v) => setRow(line.lineId, idx, { quantity: v === "" ? "" : Number(v) })}
                      />
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => removeRow(line.lineId, idx)}
                        disabled={rows.length === 1}
                        aria-label="Remove allocation"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
                <Button
                  mt="xs"
                  variant="subtle"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => addRow(line.lineId)}
                >
                  Add another location
                </Button>
              </Card>
            );
          })}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={mutation.isPending} disabled={!valid} onClick={() => mutation.mutate()}>
              Issue stock
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
