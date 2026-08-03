import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartOverview } from "@oilmart/mocks";
import { OilMartSalesTrendChart } from "./oil-mart-sales-trend-chart";

const meta: Meta<typeof OilMartSalesTrendChart> = {
  title: "Oil Mart/Overview/OilMartSalesTrendChart",
  component: OilMartSalesTrendChart,
  args: { overview: oilMartOverview, period: "THIS_WEEK", onPeriodChange: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartSalesTrendChart>;

export const ThisMonth: Story = {};

export const ThisWeek: Story = { args: { period: "THIS_WEEK" } };

export const TodayByHour: Story = {
  args: {
    period: "TODAY",
    overview: {
      ...oilMartOverview,
      period: "TODAY",
      trendBucket: "HOURS",
      salesTrend: Array.from({ length: 12 }, (_, hour) => ({
        bucketStart: `2026-08-03T${String(hour + 8).padStart(2, "0")}:00:00Z`,
        total: [0, 0, 18000, 42000, 0, 61000, 12000, 0, 39000, 0, 25000, 0][hour],
      })),
    },
  },
};

export const FullMonthScrolls: Story = {
  args: {
    period: "THIS_MONTH",
    overview: {
      ...oilMartOverview,
      period: "THIS_MONTH",
      salesTrend: Array.from({ length: 31 }, (_, day) => ({
        bucketStart: `2026-08-${String(day + 1).padStart(2, "0")}T00:00:00Z`,
        total: day % 4 === 0 ? 0 : 40000 + day * 3500,
      })),
    },
  },
};

export const WeekWithFutureDays: Story = {
  args: {
    period: "THIS_WEEK",
    overview: {
      ...oilMartOverview,
      period: "THIS_WEEK",
      salesTrend: Array.from({ length: 7 }, (_, day) => ({
        bucketStart: `2026-08-${String(day + 3).padStart(2, "0")}T00:00:00Z`,
        total: day < 2 ? 120000 - day * 40000 : 0,
      })),
    },
  },
};

export const FlatPeriod: Story = {
  args: {
    overview: {
      ...oilMartOverview,
      salesThisPeriod: 0,
      salesTrend: oilMartOverview.salesTrend.map((point) => ({ ...point, total: 0 })),
    },
  },
};
