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
    canAdjust: true,
    onSearchChange: fn(),
    onOilTypeChange: fn(),
    onLowOnlyChange: fn(),
    onRestock: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartStockToolbar>;

export const Default: Story = {};

export const BelowReorderFilterOn: Story = { args: { lowOnly: true, oilType: "ENGINE" } };

export const WithoutRestockRights: Story = { args: { canAdjust: false } };
