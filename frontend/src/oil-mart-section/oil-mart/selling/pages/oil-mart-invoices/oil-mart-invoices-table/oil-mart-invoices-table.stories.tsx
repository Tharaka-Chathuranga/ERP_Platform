import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartInvoices } from "@oilmart/mocks";
import { OilMartInvoicesTable } from "./oil-mart-invoices-table";

const meta: Meta<typeof OilMartInvoicesTable> = {
  title: "Oil Mart/Selling/OilMartInvoicesTable",
  component: OilMartInvoicesTable,
  args: {
    title: "Approved & pending approval",
    data: oilMartInvoices.filter((i) => ["PENDING_APPROVAL", "APPROVED"].includes(i.status)),
    showProfit: true,
    emptyTitle: "Nothing in progress",
    emptyDescription: "No pending or approved invoices this month.",
    onRowClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartInvoicesTable>;

export const Active: Story = {};

export const WithoutProfit: Story = { args: { showProfit: false } };

export const Rejected: Story = {
  args: {
    title: "Rejected",
    data: oilMartInvoices.filter((i) => i.status === "REJECTED"),
    emptyTitle: "Nothing rejected",
    emptyDescription: "No invoices were rejected this month.",
  },
};

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [], onNew: fn() } };
