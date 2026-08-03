import type { Meta, StoryObj } from "@storybook/react";
import { anOilMartQuotation, oilMartQuotationByStatus } from "@oilmart/mocks";
import { OilMartQuotationDetailCard } from "./oil-mart-quotation-detail-card";

const meta: Meta<typeof OilMartQuotationDetailCard> = {
  title: "Oil Mart/Selling/OilMartQuotationDetailCard",
  component: OilMartQuotationDetailCard,
  args: { quotation: anOilMartQuotation() },
};

export default meta;
type Story = StoryObj<typeof OilMartQuotationDetailCard>;

export const Draft: Story = {};

export const PendingApproval: Story = {
  args: { quotation: oilMartQuotationByStatus("PENDING_APPROVAL") },
};

export const Approved: Story = { args: { quotation: oilMartQuotationByStatus("APPROVED") } };

export const Rejected: Story = { args: { quotation: oilMartQuotationByStatus("REJECTED") } };

export const WithoutProfit: Story = {
  args: {
    quotation: anOilMartQuotation({
      totalCost: undefined,
      totalProfit: undefined,
      lines: anOilMartQuotation().lines.map((line) => ({
        ...line,
        unitCost: undefined,
        lineCost: undefined,
        lineProfit: undefined,
      })),
    }),
  },
};
