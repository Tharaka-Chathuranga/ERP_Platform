import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartMovements } from "@oilmart/mocks";
import { StockMovementsCard } from "./stock-movements-card";

const meta: Meta<typeof StockMovementsCard> = {
  title: "Oil Mart/Stock/StockMovementsCard",
  component: StockMovementsCard,
  args: {
    data: oilMartMovements,
    canAdjust: true,
    onRestock: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof StockMovementsCard>;

export const FullLedger: Story = {};

export const Loading: Story = { args: { data: [], loading: true } };

export const NoMovements: Story = { args: { data: [] } };

export const WithoutRestockRights: Story = { args: { canAdjust: false } };

export const LoadFailed: Story = {
  args: { data: [], error: new globalThis.Error("Ledger unavailable") },
};
