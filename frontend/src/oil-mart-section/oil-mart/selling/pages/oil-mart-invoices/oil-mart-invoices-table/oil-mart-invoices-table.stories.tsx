import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartInvoices } from "@oilmart/mocks";
import { OilMartInvoicesTable } from "./oil-mart-invoices-table";

const meta: Meta<typeof OilMartInvoicesTable> = {
  title: "Oil Mart/Selling/OilMartInvoicesTable",
  component: OilMartInvoicesTable,
  args: { data: oilMartInvoices, showProfit: true, onRowClick: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartInvoicesTable>;

export const WithProfit: Story = {};

export const WithoutProfit: Story = { args: { showProfit: false } };

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [], onNew: fn() } };
