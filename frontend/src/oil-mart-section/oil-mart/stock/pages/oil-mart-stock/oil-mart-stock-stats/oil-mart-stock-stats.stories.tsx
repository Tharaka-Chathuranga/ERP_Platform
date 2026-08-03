import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OilMartStockStats } from "./oil-mart-stock-stats";

const meta: Meta<typeof OilMartStockStats> = {
  title: "Oil Mart/Stock/OilMartStockStats",
  component: OilMartStockStats,
  args: {
    stockValue: 2635320,
    lowCount: 3,
    lowOnly: false,
    onShowLowOnly: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartStockStats>;

export const Default: Story = {};

export const AllStockHealthy: Story = { args: { lowCount: 0 } };

export const LowStockFilterApplied: Story = { args: { lowOnly: true } };
