import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartQuotations } from "@oilmart/mocks";
import { OilMartClientQuotationsTable } from "./oil-mart-client-quotations-table";

const meta: Meta<typeof OilMartClientQuotationsTable> = {
  title: "Oil Mart/Master Data/OilMartClientQuotationsTable",
  component: OilMartClientQuotationsTable,
  args: {
    data: oilMartQuotations.filter((q) => q.clientId === "cli-southern-transport"),
    onRowClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartClientQuotationsTable>;

export const Populated: Story = {};

export const EveryStatus: Story = { args: { data: oilMartQuotations } };

export const Loading: Story = { args: { data: [], loading: true } };

export const Empty: Story = { args: { data: [] } };
