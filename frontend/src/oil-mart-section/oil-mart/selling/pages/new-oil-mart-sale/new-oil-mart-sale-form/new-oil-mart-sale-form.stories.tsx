import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartClients, oilMartItems, oilMartStock } from "@oilmart/mocks";
import { NewOilMartSaleForm } from "./new-oil-mart-sale-form";

const meta: Meta<typeof NewOilMartSaleForm> = {
  title: "Oil Mart/Selling/NewOilMartSaleForm",
  component: NewOilMartSaleForm,
  args: {
    clients: oilMartClients,
    items: oilMartItems,
    stock: oilMartStock,
    clientId: null,
    quotedAt: new Date("2026-07-31T08:00:00Z"),
    validUntil: new Date("2026-08-14T00:00:00Z"),
    note: "",
    discountAmount: 0,
    lines: [
      {
        key: "l1",
        itemId: null,
        quantityLitres: undefined,
        listUnitPrice: undefined,
        unitPrice: undefined,
        isPriceOverride: false,
        discountPercent: 0,
      },
    ],
    showErrors: false,
    submitting: false,
    onClientChange: fn(),
    onQuotedAtChange: fn(),
    onValidUntilChange: fn(),
    onNoteChange: fn(),
    onDiscountAmountChange: fn(),
    onLineChange: fn(),
    onAddLine: fn(),
    onRemoveLine: fn(),
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NewOilMartSaleForm>;

export const Blank: Story = {};

export const Filled: Story = {
  args: {
    clientId: "cli-southern-transport",
    discountAmount: 18000,
    lines: [
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
    ],
  },
};

export const ValidationErrors: Story = { args: { showErrors: true } };

export const Submitting: Story = {
  args: { submitting: true, clientId: "cli-metro-garage" },
};
