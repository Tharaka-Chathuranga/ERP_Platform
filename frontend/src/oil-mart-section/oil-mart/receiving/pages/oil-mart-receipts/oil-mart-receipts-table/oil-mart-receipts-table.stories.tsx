import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartReceipts } from "@oilmart/mocks";
import { OilMartReceiptsTable } from "./oil-mart-receipts-table";

const meta: Meta<typeof OilMartReceiptsTable> = {
  title: "Oil Mart/Receiving/OilMartReceiptsTable",
  component: OilMartReceiptsTable,
  args: { data: oilMartReceipts, onRowClick: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptsTable>;

export const Populated: Story = {};

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };

export const Error: Story = {
  args: { data: [], error: new globalThis.Error("Receipts unavailable") },
};
