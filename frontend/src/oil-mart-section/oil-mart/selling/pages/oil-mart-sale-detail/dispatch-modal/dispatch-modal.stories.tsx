import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { anOilMartStockBalance, oilMartSaleByStatus, oilMartStock } from "@oilmart/mocks";
import { DispatchModal } from "./dispatch-modal";

const meta: Meta<typeof DispatchModal> = {
  title: "Oil Mart/Selling/DispatchModal",
  component: DispatchModal,
  args: {
    opened: true,
    sale: oilMartSaleByStatus("APPROVED"),
    stock: oilMartStock,
    onClose: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DispatchModal>;

export const StockAvailable: Story = {};

export const InsufficientStock: Story = {
  args: {
    stock: [
      anOilMartStockBalance({
        itemId: "itm-brake-dot4",
        itemCode: "OM-BRK-DOT4",
        itemName: "Brake Fluid DOT 4",
        oilType: "BRAKE",
        quantityOnHand: 12,
        reorderLevelLitres: 60,
      }),
    ],
  },
};

export const Submitting: Story = { args: { submitting: true } };
