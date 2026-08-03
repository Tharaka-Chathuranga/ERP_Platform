import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@mantine/core";
import { MoneyText } from "./money-text";

const meta: Meta<typeof MoneyText> = {
  title: "Oil Mart/Components/MoneyText",
  component: MoneyText,
  args: { value: 1450 },
};

export default meta;
type Story = StoryObj<typeof MoneyText>;

export const Default: Story = {};

export const Emphasised: Story = { args: { value: 1093000, emphasis: true } };

export const AllStates: Story = {
  render: () => (
    <Stack gap="xs">
      <MoneyText value={1450} />
      <MoneyText value={1093000} emphasis />
      <MoneyText value={0} />
      <MoneyText value={-18000} />
      <MoneyText value={null} />
      <MoneyText value={1234.5678} />
    </Stack>
  ),
};
