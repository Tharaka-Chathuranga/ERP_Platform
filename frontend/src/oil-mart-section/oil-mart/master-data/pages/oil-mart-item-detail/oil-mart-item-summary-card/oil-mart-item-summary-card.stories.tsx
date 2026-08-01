import type { Meta, StoryObj } from "@storybook/react";
import { anOilMartItemPrice, anOilMartStockBalance, oilMartItems } from "@oilmart/mocks";
import { OilMartItemSummaryCard } from "./oil-mart-item-summary-card";

const meta: Meta<typeof OilMartItemSummaryCard> = {
  title: "Oil Mart/Master Data/OilMartItemSummaryCard",
  component: OilMartItemSummaryCard,
  args: {
    item: oilMartItems[0],
    balance: anOilMartStockBalance(),
    currentPrice: anOilMartItemPrice(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartItemSummaryCard>;

export const HealthyStock: Story = {};

export const BelowReorderLevel: Story = {
  args: {
    item: oilMartItems[3],
    balance: anOilMartStockBalance({ quantityOnHand: 45.25, reorderLevelLitres: 120, stockValue: 56110 }),
  },
};

export const NoStockRecord: Story = { args: { balance: undefined } };

export const NoPriceSet: Story = { args: { currentPrice: undefined } };
