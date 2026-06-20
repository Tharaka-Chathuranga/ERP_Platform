import { ActionIcon, Button, Group, NumberInput, Paper, Stack, Switch, Table, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { ItemSelect } from "./ItemSelect";

export interface EditableLine {
  itemId: string | null;
  quantity: number | "";
  unitCost?: number | "";
  returnable?: boolean;
}

interface LineItemsEditorProps {
  lines: EditableLine[];
  onChange: (lines: EditableLine[]) => void;
  showUnitCost?: boolean;
  showReturnable?: boolean;
}

const emptyLine = (showUnitCost?: boolean, showReturnable?: boolean): EditableLine => ({
  itemId: null,
  quantity: "",
  ...(showUnitCost ? { unitCost: "" } : {}),
  ...(showReturnable ? { returnable: false } : {}),
});

export function LineItemsEditor({
  lines,
  onChange,
  showUnitCost,
  showReturnable,
}: LineItemsEditorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const update = (i: number, patch: Partial<EditableLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const add = () => onChange([...lines, emptyLine(showUnitCost, showReturnable)]);

  const addButton = (
    <Group mt="xs">
      <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={add}>
        Add line
      </Button>
    </Group>
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
        </Table.Tbody>
      </Table>
      {lines.length === 0 && (
        <Text c="dimmed" size="sm" ta="center" py="sm">
          No lines yet.
        </Text>
      )}
      {addButton}
    </div>
  );
}

export const newLine = emptyLine;
