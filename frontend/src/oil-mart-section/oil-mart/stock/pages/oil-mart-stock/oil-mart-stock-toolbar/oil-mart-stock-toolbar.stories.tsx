import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OilMartStockToolbar } from "./oil-mart-stock-toolbar";

const meta: Meta<typeof OilMartStockToolbar> = {
  title: "Oil Mart/Stock/OilMartStockToolbar",
  component: OilMartStockToolbar,
  args: {
    search: "",
    oilType: "ALL",
    lowOnly: false,
    stockValue: 2635320,
    lowCount: 3,
    onSearchChange: fn(),
    onOilTypeChange: fn(),
    onLowOnlyChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartStockToolbar>;

export const Default: Story = {};

export const AllStockHealthy: Story = { args: { lowCount: 0 } };

export const LowStockFilterOn: Story = { args: { lowOnly: true, oilType: "ENGINE" } };
