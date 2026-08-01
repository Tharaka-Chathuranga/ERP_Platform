import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSales } from "@oilmart/mocks";
import { OilMartPendingApprovalsPanel } from "./oil-mart-pending-approvals-panel";

const meta: Meta<typeof OilMartPendingApprovalsPanel> = {
  title: "Oil Mart/Overview/OilMartPendingApprovalsPanel",
  component: OilMartPendingApprovalsPanel,
  args: {
    sales: oilMartSales.filter((sale) => sale.status === "ORDERED"),
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartPendingApprovalsPanel>;

export const Pending: Story = {};

export const NothingPending: Story = { args: { sales: [] } };
