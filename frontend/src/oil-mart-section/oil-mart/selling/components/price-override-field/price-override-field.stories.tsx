import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "@storybook/test";
import { PriceOverrideField } from "./price-override-field";

const meta: Meta<typeof PriceOverrideField> = {
  title: "Oil Mart/Selling/PriceOverrideField",
  component: PriceOverrideField,
  args: { listUnitPrice: 1450, unitPrice: 1450, onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof PriceOverrideField>;

function Controlled({ list, initial }: { list: number; initial: number }) {
  const [unitPrice, setUnitPrice] = useState<number | undefined>(initial);
  return (
    <div style={{ maxWidth: 220 }}>
      <PriceOverrideField
        listUnitPrice={list}
        unitPrice={unitPrice}
        onChange={(value) => setUnitPrice(value)}
      />
    </div>
  );
}

export const AtListPrice: Story = { render: () => <Controlled list={1450} initial={1450} /> };

export const DiscountedOverride: Story = { render: () => <Controlled list={1450} initial={1380} /> };

export const PremiumOverride: Story = { render: () => <Controlled list={1450} initial={1520} /> };

export const NoListPrice: Story = {
  args: { listUnitPrice: undefined, unitPrice: undefined },
};

export const ReadOnly: Story = { args: { unitPrice: 1380, disabled: true } };
