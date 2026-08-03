import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { RejectDocumentModal } from "./reject-document-modal";

const meta: Meta<typeof RejectDocumentModal> = {
  title: "Oil Mart/Selling/RejectDocumentModal",
  component: RejectDocumentModal,
  args: { opened: true, documentNo: "QT-26-07-014", onClose: fn(), onSubmit: fn() },
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof RejectDocumentModal>;

export const Reject: Story = {};

export const Cancel: Story = {
  args: {
    title: "Cancel quotation",
    description: "QT-26-07-014 will be cancelled and can no longer be approved or invoiced.",
    confirmLabel: "Cancel quotation",
  },
};

export const Submitting: Story = { args: { submitting: true } };
