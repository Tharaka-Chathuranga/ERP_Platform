import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Group } from "@mantine/core";
import { oilMartQuotations } from "@oilmart/mocks";
import { OIL_MART_QUOTATION_BOARD_STATUSES } from "../../../components";
import { StageColumn } from "./stage-column";

const meta: Meta<typeof StageColumn> = {
  title: "Oil Mart/Selling/StageColumn",
  component: StageColumn,
  args: {
    status: "DRAFT",
    quotations: oilMartQuotations.filter((q) => q.status === "DRAFT"),
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 460 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StageColumn>;

export const Draft: Story = {};

export const PendingApproval: Story = {
  args: {
    status: "PENDING_APPROVAL",
    quotations: oilMartQuotations.filter((q) => q.status === "PENDING_APPROVAL"),
  },
};

export const Empty: Story = { args: { quotations: [] } };

export const EmptyWithStartAction: Story = {
  args: { quotations: [], onStartQuotation: fn() },
};

export const AllColumns: Story = {
  render: () => (
    <Group align="stretch" gap="md" wrap="nowrap" style={{ height: 460 }}>
      {OIL_MART_QUOTATION_BOARD_STATUSES.map((status) => (
        <StageColumn
          key={status}
          status={status}
          quotations={oilMartQuotations.filter((q) => q.status === status)}
          onSelect={fn()}
        />
      ))}
    </Group>
  ),
};
