import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { oilMartItems, oilMartStock } from "@oilmart/mocks";
import { SaleLineEditor, type SaleLineDraft } from "./sale-line-editor";

const meta: Meta<typeof SaleLineEditor> = {
  title: "Oil Mart/Selling/SaleLineEditor",
  component: SaleLineEditor,
};

export default meta;
type Story = StoryObj<typeof SaleLineEditor>;

function Controlled({
  initial,
  readOnly,
  error,
}: {
  initial: SaleLineDraft[];
  readOnly?: boolean;
  error?: string;
}) {
  const [lines, setLines] = useState<SaleLineDraft[]>(initial);
  const [discountAmount, setDiscountAmount] = useState(0);

  return (
    <SaleLineEditor
      lines={lines}
      items={oilMartItems}
      stock={oilMartStock}
      discountAmount={discountAmount}
      readOnly={readOnly}
      error={error}
      onChange={(key, patch) =>
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
      }
      onAdd={() =>
        setLines((prev) => [
          ...prev,
          {
            key: `l${prev.length + 1}`,
            itemId: null,
            quantityLitres: undefined,
            listUnitPrice: undefined,
            unitPrice: undefined,
            isPriceOverride: false,
            discountPercent: 0,
          },
        ])
      }
      onRemove={(key) => setLines((prev) => prev.filter((l) => l.key !== key))}
      onDiscountAmountChange={setDiscountAmount}
    />
  );
}

const EMPTY: SaleLineDraft = {
  key: "l1",
  itemId: null,
  quantityLitres: undefined,
  listUnitPrice: undefined,
  unitPrice: undefined,
  isPriceOverride: false,
  discountPercent: 0,
};

const FILLED: SaleLineDraft[] = [
  {
    key: "l1",
    itemId: "itm-engine-15w40",
    quantityLitres: 240,
    listUnitPrice: 1450,
    unitPrice: 1380,
    isPriceOverride: true,
    discountPercent: 0,
  },
  {
    key: "l2",
    itemId: "itm-gear-ep90",
    quantityLitres: 90,
    listUnitPrice: 1560,
    unitPrice: 1560,
    isPriceOverride: false,
    discountPercent: 2.5,
  },
];

export const SingleEmptyLine: Story = { render: () => <Controlled initial={[EMPTY]} /> };

export const WithOverrideAndDiscount: Story = { render: () => <Controlled initial={FILLED} /> };

export const ReadOnly: Story = { render: () => <Controlled initial={FILLED} readOnly /> };

export const InsufficientStock: Story = {
  render: () => (
    <Controlled
      initial={[
        {
          key: "l1",
          itemId: "itm-gear-ep90",
          quantityLitres: 500,
          listUnitPrice: 1560,
          unitPrice: 1560,
          isPriceOverride: false,
          discountPercent: 0,
        },
      ]}
    />
  ),
};

export const WithValidationError: Story = {
  render: () => <Controlled initial={[EMPTY]} error="Every line needs an oil, a quantity and a price" />,
};
