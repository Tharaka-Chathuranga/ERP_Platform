import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Stack, Text } from "@mantine/core";
import { LitreInput } from "./litre-input";

const meta: Meta<typeof LitreInput> = {
  title: "Oil Mart/Components/LitreInput",
  component: LitreInput,
};

export default meta;
type Story = StoryObj<typeof LitreInput>;

function Controlled({ initial }: { initial?: number }) {
  const [value, setValue] = useState<number | undefined>(initial);
  return (
    <Stack gap="xs" maw={280}>
      <LitreInput label="Quantity" value={value} onChange={setValue} />
      <Text size="xs" c="dimmed">
        Emitted: {value === undefined ? "undefined" : String(value)}
      </Text>
    </Stack>
  );
}

export const Empty: Story = { render: () => <Controlled /> };

export const WithValue: Story = { render: () => <Controlled initial={1250.5} /> };

export const Error: Story = {
  render: () => (
    <LitreInput
      label="Quantity"
      value={undefined}
      onChange={() => {}}
      error="Quantity is required"
      maw={280}
    />
  ),
};

export const Disabled: Story = {
  render: () => <LitreInput label="Quantity" value={200} onChange={() => {}} disabled maw={280} />,
};
