import { Alert, Button, Group, Modal, Stack, Table, Text, TextInput, Textarea } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { OilMartSale, OilMartStockBalance } from "@core/types";
import type { DispatchOilMartSaleInput } from "../../../api";

interface DispatchModalProps {
  opened: boolean;
  sale?: OilMartSale;
  stock?: OilMartStockBalance[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: DispatchOilMartSaleInput) => void;
}

export function DispatchModal({
  opened,
  sale,
  stock = [],
  submitting,
  onClose,
  onSubmit,
}: DispatchModalProps) {
  const form = useForm<DispatchOilMartSaleInput>({
    initialValues: { vehicleNo: "", driverName: "", note: "" },
    validate: {
      vehicleNo: (value) => (value.trim() ? null : "Vehicle number is required"),
      driverName: (value) => (value.trim() ? null : "Driver name is required"),
    },
  });

  useEffect(() => {
    if (opened) form.reset();
  }, [opened]);

  const onHandById = new Map(stock.map((balance) => [balance.itemId, balance.quantityOnHand]));

  const shortages = (sale?.lines ?? [])
    .map((line) => ({
      line,
      onHand: onHandById.get(line.itemId),
    }))
    .filter(({ line, onHand }) => onHand !== undefined && onHand < line.quantityLitres);

  const blocked = shortages.length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title="Dispatch sale" centered size="lg">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Dispatching {sale?.saleNo} deducts these quantities from oil mart stock.
          </Text>

          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Oil</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Required</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>On hand</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(sale?.lines ?? []).map((line) => {
                const onHand = onHandById.get(line.itemId);
                const short = onHand !== undefined && onHand < line.quantityLitres;
                return (
                  <Table.Tr key={line.id}>
                    <Table.Td>{line.itemName}</Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      {line.quantityLitres.toLocaleString()} L
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" c={short ? "red" : undefined} fw={short ? 700 : undefined}>
                        {onHand === undefined ? "—" : `${onHand.toLocaleString()} L`}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>

          {blocked && (
            <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />} title="Insufficient stock">
              {shortages
                .map(({ line, onHand }) => `${line.itemName}: ${onHand} L on hand, ${line.quantityLitres} L required`)
                .join(" · ")}
            </Alert>
          )}

          <Group grow>
            <TextInput label="Vehicle number" withAsterisk {...form.getInputProps("vehicleNo")} />
            <TextInput label="Driver name" withAsterisk {...form.getInputProps("driverName")} />
          </Group>
          <Textarea label="Note" autosize minRows={2} {...form.getInputProps("note")} />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" color="grape" loading={submitting} disabled={blocked}>
              Dispatch
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
