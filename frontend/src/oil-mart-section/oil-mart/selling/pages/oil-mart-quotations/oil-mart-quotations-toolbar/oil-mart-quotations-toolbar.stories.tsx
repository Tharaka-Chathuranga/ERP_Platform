import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartClients } from "@oilmart/mocks";
import { OilMartQuotationsToolbar } from "./oil-mart-quotations-toolbar";

const meta: Meta<typeof OilMartQuotationsToolbar> = {
  title: "Oil Mart/Selling/OilMartQuotationsToolbar",
  component: OilMartQuotationsToolbar,
  args: {
    clients: oilMartClients,
    clientId: "ALL",
    onClientChange: fn(),
    dateRange: [null, null],
    onDateRangeChange: fn(),
    showTerminal: false,
    onShowTerminalChange: fn(),
    awaitingApproval: 2,
    canCreate: true,
    onNew: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartQuotationsToolbar>;

export const Default: Story = {};

export const NothingAwaitingApproval: Story = { args: { awaitingApproval: 0 } };

export const ReadOnly: Story = { args: { canCreate: false } };
