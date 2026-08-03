import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { anOilMartItemPrice } from "@oilmart/mocks";
import { AddItemPriceModal } from "./add-item-price-modal";

const meta: Meta<typeof AddItemPriceModal> = {
  title: "Oil Mart/Master Data/AddItemPriceModal",
  component: AddItemPriceModal,
  args: { opened: true, onClose: fn(), onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof AddItemPriceModal>;

export const FirstPrice: Story = {};

export const SupersedingCurrentPrice: Story = {
  args: {
    currentPrice: anOilMartItemPrice({
      buyPrice: 1180,
      sellPrice: 1450,
      effectiveFrom: "2026-07-01",
    }),
  },
};

export const Submitting: Story = {
  args: { currentPrice: anOilMartItemPrice(), submitting: true },
};
