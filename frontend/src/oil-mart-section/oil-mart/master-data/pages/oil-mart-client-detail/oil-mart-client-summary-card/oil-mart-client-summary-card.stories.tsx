import type { Meta, StoryObj } from "@storybook/react";
import { oilMartClients } from "@oilmart/mocks";
import { OilMartClientSummaryCard } from "./oil-mart-client-summary-card";

const meta: Meta<typeof OilMartClientSummaryCard> = {
  title: "Oil Mart/Master Data/OilMartClientSummaryCard",
  component: OilMartClientSummaryCard,
  args: {
    client: oilMartClients[0],
    stats: {
      quotationCount: 4,
      approvedCount: 1,
      approvedValue: 232000,
      inFlight: 3,
      lastApprovedAt: "2026-07-18T14:00:00Z",
    },
  },
};

export default meta;
type Story = StoryObj<typeof OilMartClientSummaryCard>;

export const ActiveClient: Story = {};

export const NeverQuoted: Story = {
  args: {
    client: oilMartClients[3],
    stats: { quotationCount: 0, approvedCount: 0, approvedValue: 0, inFlight: 0 },
  },
};
