import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartQuotations } from "@oilmart/mocks";
import { OilMartQuotationsTable } from "./oil-mart-quotations-table";

const meta: Meta<typeof OilMartQuotationsTable> = {
  title: "Oil Mart/Selling/OilMartQuotationsTable",
  component: OilMartQuotationsTable,
  args: {
    title: "Approved, pending & draft",
    data: oilMartQuotations.filter((q) =>
      ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(q.status),
    ),
    showProfit: true,
    emptyTitle: "Nothing in progress",
    emptyDescription: "No draft, pending or approved quotations this month.",
    onRowClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartQuotationsTable>;

export const Active: Story = {};

export const WithoutProfit: Story = { args: { showProfit: false } };

export const Rejected: Story = {
  args: {
    title: "Rejected",
    data: oilMartQuotations.filter((q) => q.status === "REJECTED"),
    emptyTitle: "Nothing rejected",
    emptyDescription: "No quotations were rejected this month.",
  },
};

export const Closed: Story = {
  args: {
    title: "Closed",
    description: "Cancelled and no longer actionable.",
    data: oilMartQuotations.filter((q) => q.status === "CANCELLED"),
    emptyTitle: "Nothing closed",
    emptyDescription: "No quotations were cancelled this month.",
  },
};

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [], onNew: fn() } };
