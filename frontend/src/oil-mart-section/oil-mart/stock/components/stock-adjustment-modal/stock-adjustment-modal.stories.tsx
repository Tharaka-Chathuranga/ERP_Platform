import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartItems, oilMartStock } from "@oilmart/mocks";
import { StockAdjustmentModal } from "./stock-adjustment-modal";

const meta: Meta<typeof StockAdjustmentModal> = {
  title: "Oil Mart/Stock/StockAdjustmentModal",
  component: StockAdjustmentModal,
  args: {
    opened: true,
    items: oilMartItems,
    balances: oilMartStock,
    onClose: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof StockAdjustmentModal>;

export const PickAnyOil: Story = {};

export const PreselectedOil: Story = {
  args: { defaultItemId: oilMartStock[0].itemId },
};

export const Submitting: Story = {
  args: { defaultItemId: oilMartStock[0].itemId, submitting: true },
};
