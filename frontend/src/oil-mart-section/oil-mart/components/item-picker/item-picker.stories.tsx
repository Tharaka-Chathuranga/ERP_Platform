import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { oilMartItems, oilMartStock } from "@oilmart/mocks";
import { ItemPicker } from "./item-picker";

const meta: Meta<typeof ItemPicker> = {
  title: "Oil Mart/Components/ItemPicker",
  component: ItemPicker,
};

export default meta;
type Story = StoryObj<typeof ItemPicker>;

function Controlled({ initial, requiredLitres }: { initial?: string; requiredLitres?: number }) {
  const [value, setValue] = useState<string | null>(initial ?? null);
  return (
    <div style={{ maxWidth: 360 }}>
      <ItemPicker
        label="Oil"
        placeholder="Search by code or name"
        items={oilMartItems}
        stock={oilMartStock}
        value={value}
        onChange={setValue}
        requiredLitres={requiredLitres}
      />
    </div>
  );
}

export const Empty: Story = { render: () => <Controlled /> };

export const WithStockShown: Story = { render: () => <Controlled initial="itm-engine-15w40" /> };

export const InsufficientStock: Story = {
  render: () => <Controlled initial="itm-gear-ep90" requiredLitres={500} />,
};

export const NoItems: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ItemPicker label="Oil" items={[]} value={null} onChange={() => {}} />
    </div>
  ),
};
