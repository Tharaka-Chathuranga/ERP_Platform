import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OilMartItemsToolbar } from "./oil-mart-items-toolbar";

const meta: Meta<typeof OilMartItemsToolbar> = {
  title: "Oil Mart/Master Data/OilMartItemsToolbar",
  component: OilMartItemsToolbar,
  args: {
    search: "",
    oilType: "ALL",
    status: "ALL",
    canManage: true,
    onSearchChange: fn(),
    onOilTypeChange: fn(),
    onStatusChange: fn(),
    onAdd: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartItemsToolbar>;

export const Manager: Story = {};

export const AssistantReadOnly: Story = { args: { canManage: false } };

export const WithActiveFilters: Story = {
  args: { search: "15W-40", oilType: "ENGINE", status: "ACTIVE" },
};
