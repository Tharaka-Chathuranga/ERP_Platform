import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartItems, oilMartStock } from "@oilmart/mocks";
import { OilMartItemsTable } from "./oil-mart-items-table";

const meta: Meta<typeof OilMartItemsTable> = {
  title: "Oil Mart/Master Data/OilMartItemsTable",
  component: OilMartItemsTable,
  args: { data: oilMartItems, stock: oilMartStock, onRowClick: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartItemsTable>;

export const Populated: Story = {};

export const WithoutStock: Story = { args: { stock: [] } };

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };

export const Error: Story = {
  args: { data: [], error: new globalThis.Error("Failed to load oils") },
};
