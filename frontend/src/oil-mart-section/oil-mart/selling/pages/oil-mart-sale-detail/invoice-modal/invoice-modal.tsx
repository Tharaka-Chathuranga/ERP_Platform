import { Button, Group, Modal, Radio, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import type { OilMartPaymentMethod, OilMartSale } from "@core/types";
import { PAYMENT_METHOD_OPTIONS } from "../../../components/oil-mart-sale-meta";
import { MoneyText } from "../../../../components/money-text";

interface InvoiceModalProps {
  opened: boolean;
  sale?: OilMartSale;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (paymentMethod: OilMartPaymentMethod) => void;
}

export function InvoiceModal({ opened, sale, submitting, onClose, onSubmit }: InvoiceModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<OilMartPaymentMethod>("CASH");

  useEffect(() => {
    if (opened) setPaymentMethod("CASH");
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Raise invoice" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          The invoice is settled when it is raised. Record how {sale?.clientName} paid.
        </Text>

        <Group justify="space-between" align="baseline">
          <Text size="sm" fw={600}>
            Amount
          </Text>
          <MoneyText value={sale?.total} fz={26} fw={700} />
        </Group>

        <Radio.Group
          label="Payment method"
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value as OilMartPaymentMethod)}
        >
          <Stack gap="xs" mt="xs">
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </Stack>
        </Radio.Group>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button color="green" loading={submitting} onClick={() => onSubmit(paymentMethod)}>
            Raise invoice
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
