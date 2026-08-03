import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";
import { oilMartClients, oilMartItems, oilMartStock } from "@oilmart/mocks";
import { NewOilMartQuotationForm } from "./new-oil-mart-quotation-form";

const lines = [
  {
    key: "line-1",
    itemId: "itm-engine-15w40",
    quantityLitres: 200,
    listUnitPrice: 1450,
    unitPrice: 1450,
    unitCost: 1180,
    isPriceOverride: false,
    discountPercent: 0,
  },
];

const meta: Meta<typeof NewOilMartQuotationForm> = {
  title: "Oil Mart/Selling/NewOilMartQuotationForm",
  component: NewOilMartQuotationForm,
  args: {
    clients: oilMartClients,
    items: oilMartItems,
    stock: oilMartStock,
    gstRatePercent: 10,
    showProfit: true,
    clientId: "cli-southern-transport",
    onClientChange: fn(),
    onQuickAddClient: fn(),
    issuedDate: dayjs("2026-08-03").toDate(),
    onIssuedDateChange: fn(),
    validUntil: dayjs("2026-09-03").toDate(),
    onValidUntilChange: fn(),
    minValidUntil: dayjs("2026-09-03").toDate(),
    note: "",
    onNoteChange: fn(),
    lines,
    onLineChange: fn(),
    onAddLine: fn(),
    onRemoveLine: fn(),
    showErrors: false,
    submitting: false,
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NewOilMartQuotationForm>;

export const Default: Story = {};

export const WithoutProfitColumn: Story = { args: { showProfit: false } };

export const ShowingValidationErrors: Story = {
  args: {
    clientId: null,
    showErrors: true,
    lines: [{ ...lines[0], itemId: null, quantityLitres: undefined, unitPrice: undefined }],
  },
};

export const ValidityTooShort: Story = {
  args: { validUntil: dayjs("2026-08-10").toDate(), validityTooShort: true, showErrors: true },
};

export const EditingRejected: Story = { args: { editing: true, resubmits: true } };

export const Submitting: Story = { args: { submitting: true } };
