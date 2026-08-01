import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartItemPrices } from "@oilmart/mocks";
import { OilMartItemPriceHistory } from "./oil-mart-item-price-history";

const meta: Meta<typeof OilMartItemPriceHistory> = {
  title: "Oil Mart/Master Data/OilMartItemPriceHistory",
  component: OilMartItemPriceHistory,
  args: {
    data: oilMartItemPrices.filter((p) => p.itemId === "itm-engine-15w40"),
    canManage: true,
    onAdd: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartItemPriceHistory>;

export const FullTimeline: Story = {};

export const ReadOnly: Story = { args: { canManage: false } };

export const Loading: Story = { args: { data: [], loading: true } };

export const NoPrices: Story = { args: { data: [] } };
