import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSaleByStatus } from "@oilmart/mocks";
import { InvoiceModal } from "./invoice-modal";

const meta: Meta<typeof InvoiceModal> = {
  title: "Oil Mart/Selling/InvoiceModal",
  component: InvoiceModal,
  args: {
    opened: true,
    sale: oilMartSaleByStatus("DISPATCHED"),
    onClose: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof InvoiceModal>;

export const Default: Story = {};

export const Submitting: Story = { args: { submitting: true } };
