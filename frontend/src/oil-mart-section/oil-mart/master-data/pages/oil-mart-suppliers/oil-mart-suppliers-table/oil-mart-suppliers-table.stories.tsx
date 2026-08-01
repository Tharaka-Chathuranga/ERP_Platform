import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSuppliers } from "@oilmart/mocks";
import { OilMartSuppliersTable } from "./oil-mart-suppliers-table";

const meta: Meta<typeof OilMartSuppliersTable> = {
  title: "Oil Mart/Master Data/OilMartSuppliersTable",
  component: OilMartSuppliersTable,
  args: { data: oilMartSuppliers, canManage: true, onEdit: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartSuppliersTable>;

export const Populated: Story = {};

export const ReadOnly: Story = { args: { canManage: false } };

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };
