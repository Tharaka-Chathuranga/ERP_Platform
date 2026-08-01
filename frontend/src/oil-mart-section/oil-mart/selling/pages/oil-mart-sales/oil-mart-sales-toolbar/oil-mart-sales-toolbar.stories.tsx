import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartClients } from "@oilmart/mocks";
import { OilMartSalesToolbar } from "./oil-mart-sales-toolbar";

const meta: Meta<typeof OilMartSalesToolbar> = {
  title: "Oil Mart/Selling/OilMartSalesToolbar",
  component: OilMartSalesToolbar,
  args: {
    clients: oilMartClients,
    clientId: "ALL",
    dateRange: [null, null],
    showTerminal: false,
    awaitingApproval: 1,
    canCreate: true,
    onClientChange: fn(),
    onDateRangeChange: fn(),
    onShowTerminalChange: fn(),
    onNew: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartSalesToolbar>;

export const Assistant: Story = {};

export const ManagerNoCreate: Story = { args: { canCreate: false, awaitingApproval: 4 } };

export const NothingAwaitingApproval: Story = { args: { awaitingApproval: 0 } };
