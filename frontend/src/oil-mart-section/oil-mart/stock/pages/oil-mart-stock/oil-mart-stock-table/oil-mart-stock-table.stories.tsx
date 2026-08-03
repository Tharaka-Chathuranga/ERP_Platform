import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartStock } from "@oilmart/mocks";
import { OilMartStockTable } from "./oil-mart-stock-table";

const meta: Meta<typeof OilMartStockTable> = {
  title: "Oil Mart/Stock/OilMartStockTable",
  component: OilMartStockTable,
  args: { data: oilMartStock, onRowClick: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartStockTable>;

export const Populated: Story = {};

export const AllHealthy: Story = {
  args: { data: oilMartStock.filter((s) => s.quantityOnHand >= s.reorderLevelLitres) },
};

export const OnlyLowStock: Story = {
  args: { data: oilMartStock.filter((s) => s.quantityOnHand < s.reorderLevelLitres) },
};

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };
