import type { Meta, StoryObj } from "@storybook/react";
import { oilMartReceipts } from "@oilmart/mocks";
import { OilMartReceiptSummaryCard } from "./oil-mart-receipt-summary-card";

const meta: Meta<typeof OilMartReceiptSummaryCard> = {
  title: "Oil Mart/Receiving/OilMartReceiptSummaryCard",
  component: OilMartReceiptSummaryCard,
  args: { receipt: oilMartReceipts[0] },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptSummaryCard>;

export const SingleLine: Story = {};

export const MultiLine: Story = { args: { receipt: oilMartReceipts[1] } };
