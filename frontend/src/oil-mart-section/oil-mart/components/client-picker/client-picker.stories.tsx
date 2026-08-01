import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { oilMartClients } from "@oilmart/mocks";
import { ClientPicker } from "./client-picker";

const meta: Meta<typeof ClientPicker> = {
  title: "Oil Mart/Components/ClientPicker",
  component: ClientPicker,
};

export default meta;
type Story = StoryObj<typeof ClientPicker>;

function Controlled({ initial }: { initial?: string }) {
  const [value, setValue] = useState<string | null>(initial ?? null);
  return (
    <div style={{ maxWidth: 360 }}>
      <ClientPicker
        label="Client"
        placeholder="Search by code or name"
        clients={oilMartClients}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export const Empty: Story = { render: () => <Controlled /> };

export const Selected: Story = { render: () => <Controlled initial="cli-southern-transport" /> };

export const Required: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ClientPicker
        label="Client"
        withAsterisk
        clients={oilMartClients}
        value={null}
        onChange={() => {}}
        error="Select a client"
      />
    </div>
  ),
};
