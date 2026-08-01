import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSuppliers } from "@oilmart/mocks";
import { OilMartReceiptsToolbar } from "./oil-mart-receipts-toolbar";

const meta: Meta<typeof OilMartReceiptsToolbar> = {
  title: "Oil Mart/Receiving/OilMartReceiptsToolbar",
  component: OilMartReceiptsToolbar,
  args: {
    suppliers: oilMartSuppliers,
    supplierId: "ALL",
    dateRange: [null, null],
    canReceive: true,
    onSupplierChange: fn(),
    onDateRangeChange: fn(),
    onNew: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptsToolbar>;

export const Assistant: Story = {};

export const ManagerReadOnly: Story = { args: { canReceive: false } };

export const Filtered: Story = {
  args: {
    supplierId: "sup-lanka-lubricants",
    dateRange: [new Date("2026-07-01"), new Date("2026-07-31")],
  },
};
