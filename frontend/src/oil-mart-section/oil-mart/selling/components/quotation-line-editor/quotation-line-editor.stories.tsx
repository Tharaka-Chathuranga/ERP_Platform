import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartItems, oilMartStock } from "@oilmart/mocks";
import { QuotationLineEditor, type QuotationLineDraft } from "./quotation-line-editor";

const line = (over: Partial<QuotationLineDraft> = {}): QuotationLineDraft => ({
  key: "line-1",
  itemId: "itm-engine-15w40",
  quantityLitres: 200,
  listUnitPrice: 1450,
  unitPrice: 1450,
  unitCost: 1180,
  isPriceOverride: false,
  discountPercent: 0,
  ...over,
});

const meta: Meta<typeof QuotationLineEditor> = {
  title: "Oil Mart/Selling/QuotationLineEditor",
  component: QuotationLineEditor,
  args: {
    lines: [line()],
    items: oilMartItems,
    stock: oilMartStock,
    gstRatePercent: 10,
    showProfit: true,
    onChange: fn(),
    onAdd: fn(),
    onRemove: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof QuotationLineEditor>;

export const WithProfit: Story = {};

export const WithoutProfit: Story = { args: { showProfit: false } };

export const SellingBelowCost: Story = {
  args: { lines: [line({ unitPrice: 900, isPriceOverride: true })] },
};

export const MultipleLines: Story = {
  args: {
    lines: [
      line(),
      line({
        key: "line-2",
        itemId: "itm-hydraulic-68",
        quantityLitres: 120,
        listUnitPrice: 1105,
        unitPrice: 1050,
        unitCost: 895,
        isPriceOverride: true,
        discountPercent: 5,
      }),
    ],
  },
};

export const ReadOnly: Story = { args: { readOnly: true } };

export const WithError: Story = {
  args: {
    lines: [line({ itemId: null, quantityLitres: undefined, unitPrice: undefined })],
    error: "Every line needs an oil, a quantity and a price",
  },
};
