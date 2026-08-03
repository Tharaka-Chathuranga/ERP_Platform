import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { anOilMartQuotation, oilMartQuotationByStatus } from "@oilmart/mocks";
import { ApproveDocumentModal } from "./approve-document-modal";

const meta: Meta<typeof ApproveDocumentModal> = {
  title: "Oil Mart/Selling/ApproveDocumentModal",
  component: ApproveDocumentModal,
  args: {
    opened: true,
    quotation: oilMartQuotationByStatus("PENDING_APPROVAL"),
    onClose: fn(),
    onSubmit: fn(),
  },
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ApproveDocumentModal>;

export const WithPriceOverrides: Story = {};

export const WithoutOverrides: Story = { args: { quotation: anOilMartQuotation() } };

export const Expired: Story = {
  args: {
    quotation: anOilMartQuotation({
      status: "PENDING_APPROVAL",
      expired: true,
      validUntil: "2026-07-01",
    }),
  },
};

export const Submitting: Story = { args: { submitting: true } };
