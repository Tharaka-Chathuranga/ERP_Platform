import type { Meta, StoryObj } from "@storybook/react";
import { oilMartReceipts } from "@oilmart/mocks";
import { OilMartReceiptLines } from "./oil-mart-receipt-lines";

const meta: Meta<typeof OilMartReceiptLines> = {
  title: "Oil Mart/Receiving/OilMartReceiptLines",
  component: OilMartReceiptLines,
  args: { lines: oilMartReceipts[1].lines },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptLines>;

export const MultiLine: Story = {};

export const SingleLine: Story = { args: { lines: oilMartReceipts[0].lines } };
