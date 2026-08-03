import type { Meta, StoryObj } from "@storybook/react";
import { Group } from "@mantine/core";
import { OilMartStatusBadge, OIL_MART_QUOTATION_STATUSES } from "./oil-mart-status-badge";

const meta: Meta<typeof OilMartStatusBadge> = {
  title: "Oil Mart/Components/OilMartStatusBadge",
  component: OilMartStatusBadge,
  args: { status: "PENDING_APPROVAL" },
};

export default meta;
type Story = StoryObj<typeof OilMartStatusBadge>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <Group>
      {OIL_MART_QUOTATION_STATUSES.map((status) => (
        <OilMartStatusBadge key={status} status={status} />
      ))}
    </Group>
  ),
};

export const Unknown: Story = { args: { status: undefined } };
