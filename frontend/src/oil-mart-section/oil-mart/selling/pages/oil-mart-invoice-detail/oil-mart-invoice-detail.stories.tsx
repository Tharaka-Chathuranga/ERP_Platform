import type { Meta, StoryObj } from "@storybook/react";
import { OilMartInvoiceDetailPage } from "./oil-mart-invoice-detail";

const meta: Meta<typeof OilMartInvoiceDetailPage> = {
  title: "Oil Mart/Selling/OilMartInvoiceDetailPage",
  component: OilMartInvoiceDetailPage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/invoices/invoice-pending",
    routePath: "/oil-mart/invoices/:invoiceId",
  },
};

export default meta;
type Story = StoryObj<typeof OilMartInvoiceDetailPage>;

export const PendingApprovalAsManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const PendingApprovalAsAssistant: Story = {
  parameters: { role: "OIL_MART_ASSISTANT" },
};

export const RejectedAsAssistant: Story = {
  parameters: {
    role: "OIL_MART_ASSISTANT",
    route: "/oil-mart/invoices/invoice-rejected",
  },
};

export const Approved: Story = {
  parameters: {
    role: "STORES_MANAGER",
    route: "/oil-mart/invoices/invoice-approved",
  },
};
