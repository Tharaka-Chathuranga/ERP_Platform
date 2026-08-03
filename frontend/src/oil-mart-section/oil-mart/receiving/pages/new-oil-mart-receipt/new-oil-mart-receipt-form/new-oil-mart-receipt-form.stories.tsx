import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartItems, oilMartSuppliers } from "@oilmart/mocks";
import { NewOilMartReceiptForm } from "./new-oil-mart-receipt-form";

const meta: Meta<typeof NewOilMartReceiptForm> = {
  title: "Oil Mart/Receiving/NewOilMartReceiptForm",
  component: NewOilMartReceiptForm,
  args: {
    suppliers: oilMartSuppliers,
    items: oilMartItems,
    supplierId: null,
    referenceNo: "",
    receivedAt: new Date("2026-07-31T08:00:00Z"),
    note: "",
    lines: [{ key: "l1", itemId: null, quantityLitres: undefined, buyUnitPrice: undefined }],
    showErrors: false,
    submitting: false,
    onSupplierChange: fn(),
    onReferenceNoChange: fn(),
    onReceivedAtChange: fn(),
    onNoteChange: fn(),
    onLineChange: fn(),
    onAddLine: fn(),
    onRemoveLine: fn(),
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NewOilMartReceiptForm>;

export const Blank: Story = {};

export const Filled: Story = {
  args: {
    supplierId: "sup-lanka-lubricants",
    referenceNo: "INV-LL-88396",
    lines: [
      { key: "l1", itemId: "itm-engine-15w40", quantityLitres: 500, buyUnitPrice: 1180 },
      { key: "l2", itemId: "itm-hydraulic-68", quantityLitres: 500, buyUnitPrice: 890 },
    ],
  },
};

export const ValidationErrors: Story = { args: { showErrors: true } };

export const Submitting: Story = {
  args: {
    submitting: true,
    supplierId: "sup-lanka-lubricants",
    lines: [{ key: "l1", itemId: "itm-engine-15w40", quantityLitres: 500, buyUnitPrice: 1180 }],
  },
};
