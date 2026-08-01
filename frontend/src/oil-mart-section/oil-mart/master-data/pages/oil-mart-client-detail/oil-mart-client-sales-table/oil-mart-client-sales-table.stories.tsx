import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSales } from "@oilmart/mocks";
import { OilMartClientSalesTable } from "./oil-mart-client-sales-table";

const meta: Meta<typeof OilMartClientSalesTable> = {
  title: "Oil Mart/Master Data/OilMartClientSalesTable",
  component: OilMartClientSalesTable,
  args: {
    data: oilMartSales.filter((sale) => sale.clientId === "cli-southern-transport"),
    onRowClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartClientSalesTable>;

export const Populated: Story = {};

export const EveryStatus: Story = { args: { data: oilMartSales } };

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };
