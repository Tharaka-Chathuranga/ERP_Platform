import type { Meta, StoryObj } from "@storybook/react";
import { OilMartQuotationDetailPage } from "./oil-mart-quotation-detail";

const meta: Meta<typeof OilMartQuotationDetailPage> = {
  title: "Oil Mart/Selling/OilMartQuotationDetailPage",
  component: OilMartQuotationDetailPage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/quotations/quotation-draft",
    routePath: "/oil-mart/quotations/:quotationId",
  },
};

export default meta;
type Story = StoryObj<typeof OilMartQuotationDetailPage>;

export const DraftAsAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const PendingApprovalAsManager: Story = {
  parameters: {
    role: "OIL_MART_SALES_MANAGER",
    route: "/oil-mart/quotations/quotation-pending",
  },
};

export const RejectedAsAssistant: Story = {
  parameters: {
    role: "OIL_MART_SALES_ASSISTANT",
    route: "/oil-mart/quotations/quotation-rejected",
  },
};

export const ExpiredApproved: Story = {
  parameters: {
    role: "OIL_MART_SALES_MANAGER",
    route: "/oil-mart/quotations/quotation-expired",
  },
};
