import type { Meta, StoryObj } from "@storybook/react";
import { Group } from "@mantine/core";
import { OIL_MART_SALE_STATUSES, OilMartStatusBadge } from "./oil-mart-status-badge";

const meta: Meta<typeof OilMartStatusBadge> = {
  title: "Oil Mart/Components/OilMartStatusBadge",
  component: OilMartStatusBadge,
  args: { status: "ORDERED" },
};

export default meta;
type Story = StoryObj<typeof OilMartStatusBadge>;

export const Default: Story = {};

export const EveryStatus: Story = {
  render: () => (
    <Group gap="xs">
      {OIL_MART_SALE_STATUSES.map((status) => (
        <OilMartStatusBadge key={status} status={status} />
      ))}
    </Group>
  ),
};

export const Unknown: Story = { args: { status: undefined } };
