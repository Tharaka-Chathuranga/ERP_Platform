import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { oilMartItems } from "@oilmart/mocks";
import { ReceiptLineEditor, type ReceiptLineDraft } from "./receipt-line-editor";

const meta: Meta<typeof ReceiptLineEditor> = {
  title: "Oil Mart/Receiving/ReceiptLineEditor",
  component: ReceiptLineEditor,
};

export default meta;
type Story = StoryObj<typeof ReceiptLineEditor>;

function Controlled({ initial, error }: { initial: ReceiptLineDraft[]; error?: string }) {
  const [lines, setLines] = useState<ReceiptLineDraft[]>(initial);
  let counter = initial.length;

  return (
    <ReceiptLineEditor
      lines={lines}
      items={oilMartItems}
      error={error}
      onChange={(key, patch) =>
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
      }
      onAdd={() => {
        counter += 1;
        setLines((prev) => [
          ...prev,
          { key: `new-${counter}-${prev.length}`, itemId: null, quantityLitres: undefined, buyUnitPrice: undefined },
        ]);
      }}
      onRemove={(key) => setLines((prev) => prev.filter((l) => l.key !== key))}
    />
  );
}

const EMPTY_LINE: ReceiptLineDraft = {
  key: "l1",
  itemId: null,
  quantityLitres: undefined,
  buyUnitPrice: undefined,
};

export const SingleEmptyLine: Story = { render: () => <Controlled initial={[EMPTY_LINE]} /> };

export const FilledLines: Story = {
  render: () => (
    <Controlled
      initial={[
        { key: "l1", itemId: "itm-engine-15w40", quantityLitres: 500, buyUnitPrice: 1180 },
        { key: "l2", itemId: "itm-hydraulic-68", quantityLitres: 500, buyUnitPrice: 890 },
      ]}
    />
  ),
};

export const WithValidationError: Story = {
  render: () => <Controlled initial={[EMPTY_LINE]} error="Every line needs an oil, a quantity and a buy price" />,
};
