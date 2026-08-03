import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { anOilMartQuotation, oilMartQuotations } from "@oilmart/mocks";
import { QuotationPicker } from "./quotation-picker";

const approved = oilMartQuotations.filter((q) => q.status === "APPROVED");

const meta: Meta<typeof QuotationPicker> = {
  title: "Oil Mart/Selling/QuotationPicker",
  component: QuotationPicker,
  args: { quotations: approved, value: null, onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof QuotationPicker>;

export const Choosing: Story = {};

export const Selected: Story = { args: { value: approved[0]?.id ?? null } };

export const ExpiredSelected: Story = {
  args: {
    quotations: [
      anOilMartQuotation({
        id: "quotation-expired",
        quotationNo: "QT-26-06-004",
        status: "APPROVED",
        expired: true,
        validUntil: "2026-07-01",
      }),
    ],
    value: "quotation-expired",
  },
};

export const NothingToInvoice: Story = { args: { quotations: [] } };

export const WithError: Story = { args: { error: "Select a quotation to invoice" } };
