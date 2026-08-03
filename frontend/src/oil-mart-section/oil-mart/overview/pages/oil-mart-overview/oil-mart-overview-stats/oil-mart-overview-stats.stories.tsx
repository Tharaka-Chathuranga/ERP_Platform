import type { Meta, StoryObj } from "@storybook/react";
import { oilMartOverview } from "@oilmart/mocks";
import { OilMartOverviewStats } from "./oil-mart-overview-stats";

const meta: Meta<typeof OilMartOverviewStats> = {
  title: "Oil Mart/Overview/OilMartOverviewStats",
  component: OilMartOverviewStats,
  args: { overview: oilMartOverview },
};

export default meta;
type Story = StoryObj<typeof OilMartOverviewStats>;

export const Default: Story = {};

export const AllClear: Story = {
  args: { overview: { ...oilMartOverview, awaitingApproval: 0, lowStockCount: 0 } },
};
