import type { Meta, StoryObj } from "@storybook/react";
import { anOilMartInvoice, oilMartInvoiceByStatus } from "@oilmart/mocks";
import { OilMartInvoiceDetailCard } from "./oil-mart-invoice-detail-card";

const meta: Meta<typeof OilMartInvoiceDetailCard> = {
  title: "Oil Mart/Selling/OilMartInvoiceDetailCard",
  component: OilMartInvoiceDetailCard,
  args: { invoice: anOilMartInvoice() },
};

export default meta;
type Story = StoryObj<typeof OilMartInvoiceDetailCard>;

export const PendingApproval: Story = {};

export const Approved: Story = { args: { invoice: oilMartInvoiceByStatus("APPROVED") } };

export const Rejected: Story = { args: { invoice: oilMartInvoiceByStatus("REJECTED") } };

export const WithoutProfit: Story = {
  args: {
    invoice: anOilMartInvoice({
      totalCost: undefined,
      totalProfit: undefined,
      lines: anOilMartInvoice().lines.map((line) => ({
        ...line,
        unitCost: undefined,
        lineCost: undefined,
        lineProfit: undefined,
      })),
    }),
  },
};
