import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OilMartClientsToolbar } from "./oil-mart-clients-toolbar";

const meta: Meta<typeof OilMartClientsToolbar> = {
  title: "Oil Mart/Master Data/OilMartClientsToolbar",
  component: OilMartClientsToolbar,
  args: {
    search: "",
    status: "ALL",
    canManage: true,
    onSearchChange: fn(),
    onStatusChange: fn(),
    onAdd: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartClientsToolbar>;

export const Manager: Story = {};

export const ReadOnly: Story = { args: { canManage: false } };
