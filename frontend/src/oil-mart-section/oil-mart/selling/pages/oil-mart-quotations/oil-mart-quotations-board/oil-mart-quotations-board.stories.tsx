import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartQuotations } from "@oilmart/mocks";
import { OilMartQuotationsBoard } from "./oil-mart-quotations-board";

const meta: Meta<typeof OilMartQuotationsBoard> = {
  title: "Oil Mart/Selling/OilMartQuotationsBoard",
  component: OilMartQuotationsBoard,
  args: { quotations: oilMartQuotations, onSelect: fn() },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "80vh", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OilMartQuotationsBoard>;

export const Default: Story = {};

export const WithTerminalColumns: Story = { args: { showTerminal: true } };

export const Loading: Story = { args: { loading: true, quotations: [] } };

export const Empty: Story = { args: { quotations: [], onStartQuotation: fn() } };

export const Failed: Story = {
  args: { quotations: [], error: new Error("Could not load quotations") },
};
