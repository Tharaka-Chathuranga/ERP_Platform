import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartQuotations } from "@oilmart/mocks";
import { OilMartPendingApprovalsPanel } from "./oil-mart-pending-approvals-panel";

const meta: Meta<typeof OilMartPendingApprovalsPanel> = {
  title: "Oil Mart/Overview/OilMartPendingApprovalsPanel",
  component: OilMartPendingApprovalsPanel,
  args: {
    quotations: oilMartQuotations.filter((q) => q.status === "PENDING_APPROVAL"),
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartPendingApprovalsPanel>;

export const Pending: Story = {};

export const NothingPending: Story = { args: { quotations: [] } };
