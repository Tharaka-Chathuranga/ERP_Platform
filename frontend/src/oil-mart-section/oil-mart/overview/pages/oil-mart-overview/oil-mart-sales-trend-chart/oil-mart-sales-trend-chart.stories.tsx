import type { Meta, StoryObj } from "@storybook/react";
import { oilMartOverview } from "@oilmart/mocks";
import { OilMartSalesTrendChart } from "./oil-mart-sales-trend-chart";

const meta: Meta<typeof OilMartSalesTrendChart> = {
  title: "Oil Mart/Overview/OilMartSalesTrendChart",
  component: OilMartSalesTrendChart,
  args: { overview: oilMartOverview },
};

export default meta;
type Story = StoryObj<typeof OilMartSalesTrendChart>;

export const Default: Story = {};

export const FlatWeek: Story = {
  args: {
    overview: {
      ...oilMartOverview,
      salesTrend: oilMartOverview.salesTrend.map((point) => ({ ...point, total: 0 })),
      revenueByMethod: [],
    },
  },
};
