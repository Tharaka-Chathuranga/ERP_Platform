import type { Meta, StoryObj } from "@storybook/react";
import { Group } from "@mantine/core";
import { OIL_TYPES, OilTypeBadge } from "./oil-type-badge";

const meta: Meta<typeof OilTypeBadge> = {
  title: "Oil Mart/Components/OilTypeBadge",
  component: OilTypeBadge,
  args: { oilType: "ENGINE" },
};

export default meta;
type Story = StoryObj<typeof OilTypeBadge>;

export const Default: Story = {};

export const EveryType: Story = {
  render: () => (
    <Group gap="xs">
      {OIL_TYPES.map((oilType) => (
        <OilTypeBadge key={oilType} oilType={oilType} />
      ))}
    </Group>
  ),
};
