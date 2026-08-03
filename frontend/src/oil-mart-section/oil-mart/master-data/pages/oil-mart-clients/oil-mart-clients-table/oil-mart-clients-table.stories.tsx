import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartClients } from "@oilmart/mocks";
import { OilMartClientsTable } from "./oil-mart-clients-table";

const meta: Meta<typeof OilMartClientsTable> = {
  title: "Oil Mart/Master Data/OilMartClientsTable",
  component: OilMartClientsTable,
  args: { data: oilMartClients, canManage: true, onEdit: fn(), onRowClick: fn() },
};

export default meta;
type Story = StoryObj<typeof OilMartClientsTable>;

export const Populated: Story = {};

export const ReadOnly: Story = { args: { canManage: false } };

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };
