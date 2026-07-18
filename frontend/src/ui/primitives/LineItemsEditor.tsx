import { ActionIcon, Button, Group, NumberInput, Paper, Stack, Switch, Table, Text, TextInput } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { ItemSelect } from "./ItemSelect";

export interface EditableLine {
  itemId: string | null;
  quantity: number | "";
  unitCost?: number | "";
  returnable?: boolean;
  general?: boolean;
  rack?: string;
  row?: string;
  column?: string;
}

interface LineItemsEditorProps {
  lines: EditableLine[];
  onChange: (lines: EditableLine[]) => void;
  showUnitCost?: boolean;
  showReturnable?: boolean;
  /** Show Rack / Row / Column inputs so a line records the slot it is put away into. */
  showLocation?: boolean;
}

const emptyLine = (
  showUnitCost?: boolean,
  showReturnable?: boolean,
  showLocation?: boolean,
): EditableLine => ({
  itemId: null,
  quantity: "",
  ...(showUnitCost ? { unitCost: "" } : {}),
  ...(showReturnable ? { returnable: false } : {}),
  ...(showLocation ? { general: true, rack: "", row: "", column: "" } : {}),
});

export function LineItemsEditor({
  lines,
  onChange,
  showUnitCost,
  showReturnable,
  showLocation,
}: LineItemsEditorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const update = (i: number, patch: Partial<EditableLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const add = () => onChange([...lines, emptyLine(showUnitCost, showReturnable, showLocation)]);

  const addButton = (
    <Button variant="default" size="xs" leftSection={<IconPlus size={14} />} onClick={add}>
      Add item
    </Button>
  );

  if (isMobile) {
    return (
      <div>
        <Stack gap="sm">
          {lines.map((line, i) => (
            <Paper key={i} withBorder p="sm" radius="sm">
              <Stack gap="xs">
                <ItemSelect
                  label="Item"
                  value={line.itemId}
                  onChange={(v) => update(i, { itemId: v })}
                />
                <NumberInput
                  label="Quantity"
                  min={0}
                  value={line.quantity}
                  onChange={(v) => update(i, { quantity: v === "" ? "" : Number(v) })}
                  placeholder="0"
                />
                {showUnitCost && (
                  <NumberInput
                    label="Unit cost"
                    min={0}
                    decimalScale={2}
                    value={line.unitCost ?? ""}
                    onChange={(v) => update(i, { unitCost: v === "" ? "" : Number(v) })}
                    placeholder="0.00"
                  />
                )}
                {showReturnable && (
                  <Switch
                    label="Returnable"
                    checked={!!line.returnable}
                    onChange={(e) => update(i, { returnable: e.currentTarget.checked })}
                  />
                )}
                {showLocation && (
                  <Stack gap="xs">
                    <Switch
                      label="General location"
                      checked={line.general ?? false}
                      onChange={(e) =>
                        update(i, { general: e.currentTarget.checked, rack: "", row: "", column: "" })
                      }
                    />
                    {!line.general && (
                      <Group grow>
                        <TextInput
                          label="Rack"
                          value={line.rack ?? ""}
                          onChange={(e) => update(i, { rack: e.currentTarget.value })}
                        />
                        <TextInput
                          label="Row"
                          value={line.row ?? ""}
                          onChange={(e) => update(i, { row: e.currentTarget.value })}
                        />
                        <TextInput
                          label="Column"
                          value={line.column ?? ""}
                          onChange={(e) => update(i, { column: e.currentTarget.value })}
                        />
                      </Group>
                    )}
                  </Stack>
                )}
                <Group justify="flex-end">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="lg"
                    onClick={() => remove(i)}
                    disabled={lines.length === 1}
                    aria-label="Remove line"
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
        {lines.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="sm">
            No lines yet.
          </Text>
        )}
        {addButton}
      </div>
    );
  }

  return (
    <div>
      <Table verticalSpacing="xs" withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item</Table.Th>
            <Table.Th w={130}>Quantity</Table.Th>
            {showUnitCost && <Table.Th w={130}>Unit cost</Table.Th>}
            {showReturnable && <Table.Th w={110}>Returnable</Table.Th>}
            {showLocation && <Table.Th w={260}>Location (rack / row / column)</Table.Th>}
            <Table.Th w={40} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line, i) => (
            <Table.Tr key={i}>
              <Table.Td>
                <ItemSelect value={line.itemId} onChange={(v) => update(i, { itemId: v })} />
              </Table.Td>
              <Table.Td>
                <NumberInput
                  min={0}
                  value={line.quantity}
                  onChange={(v) => update(i, { quantity: v === "" ? "" : Number(v) })}
                  placeholder="0"
                />
              </Table.Td>
              {showUnitCost && (
                <Table.Td>
                  <NumberInput
                    min={0}
                    decimalScale={2}
                    value={line.unitCost ?? ""}
                    onChange={(v) => update(i, { unitCost: v === "" ? "" : Number(v) })}
                    placeholder="0.00"
                  />
                </Table.Td>
              )}
              {showReturnable && (
                <Table.Td>
                  <Switch
                    checked={!!line.returnable}
                    onChange={(e) => update(i, { returnable: e.currentTarget.checked })}
                  />
                </Table.Td>
              )}
              {showLocation && (
                <Table.Td>
                  <Stack gap="xs">
                    <Switch
                      size="xs"
                      label="General"
                      checked={line.general ?? false}
                      onChange={(e) =>
                        update(i, { general: e.currentTarget.checked, rack: "", row: "", column: "" })
                      }
                    />
                    {!line.general && (
                      <Group gap="xs" wrap="nowrap">
                        <TextInput
                          placeholder="Rack"
                          value={line.rack ?? ""}
                          onChange={(e) => update(i, { rack: e.currentTarget.value })}
                        />
                        <TextInput
                          placeholder="Row"
                          value={line.row ?? ""}
                          onChange={(e) => update(i, { row: e.currentTarget.value })}
                        />
                        <TextInput
                          placeholder="Col"
                          value={line.column ?? ""}
                          onChange={(e) => update(i, { column: e.currentTarget.value })}
                        />
                      </Group>
                    )}
                  </Stack>
                </Table.Td>
              )}
              <Table.Td>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => remove(i)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr>
            <Table.Td pt="xs">
              {addButton}
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      {lines.length === 0 && (
        <Text c="dimmed" size="sm" ta="center" py="sm">
          No lines yet.
        </Text>
      )}
    </div>
  );
}

export const newLine = emptyLine;
