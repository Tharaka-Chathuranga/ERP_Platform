import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@mantine/core";
import { DocumentTotals } from "./document-totals";

const meta: Meta<typeof DocumentTotals> = {
  title: "Oil Mart/Selling/DocumentTotals",
  component: DocumentTotals,
  args: { subtotal: 290000, gstRatePercent: 10, totalProfit: 54000 },
  decorators: [
    (Story) => (
      <Card withBorder radius="md" padding="lg" w={520}>
        <Story />
      </Card>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DocumentTotals>;

export const WithProfit: Story = {};

export const WithoutProfit: Story = { args: { totalProfit: undefined } };

export const MakingALoss: Story = { args: { totalProfit: -12500 } };

export const Empty: Story = { args: { subtotal: 0, totalProfit: 0 } };
