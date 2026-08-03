import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OilMartSuppliersToolbar } from "./oil-mart-suppliers-toolbar";

const meta: Meta<typeof OilMartSuppliersToolbar> = {
  title: "Oil Mart/Master Data/OilMartSuppliersToolbar",
  component: OilMartSuppliersToolbar,
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
type Story = StoryObj<typeof OilMartSuppliersToolbar>;

export const Manager: Story = {};

export const ReadOnly: Story = { args: { canManage: false } };
