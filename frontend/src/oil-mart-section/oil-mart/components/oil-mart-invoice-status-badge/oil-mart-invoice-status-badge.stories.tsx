import type { Meta, StoryObj } from "@storybook/react";
import { Group } from "@mantine/core";
import {
  OilMartInvoiceStatusBadge,
  OIL_MART_INVOICE_STATUSES,
} from "./oil-mart-invoice-status-badge";

const meta: Meta<typeof OilMartInvoiceStatusBadge> = {
  title: "Oil Mart/Components/OilMartInvoiceStatusBadge",
  component: OilMartInvoiceStatusBadge,
  args: { status: "PENDING_APPROVAL" },
};

export default meta;
type Story = StoryObj<typeof OilMartInvoiceStatusBadge>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <Group>
      {OIL_MART_INVOICE_STATUSES.map((status) => (
        <OilMartInvoiceStatusBadge key={status} status={status} />
      ))}
    </Group>
  ),
};
