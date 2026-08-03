import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartStock } from "@oilmart/mocks";
import { OilMartLowStockPanel } from "./oil-mart-low-stock-panel";

const meta: Meta<typeof OilMartLowStockPanel> = {
  title: "Oil Mart/Overview/OilMartLowStockPanel",
  component: OilMartLowStockPanel,
  args: {
    balances: oilMartStock.filter((s) => s.quantityOnHand < s.reorderLevelLitres),
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartLowStockPanel>;

export const WithLowStock: Story = {};

export const AllStocked: Story = { args: { balances: [] } };
