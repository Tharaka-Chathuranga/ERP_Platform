import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { RejectSaleModal } from "./reject-sale-modal";

const meta: Meta<typeof RejectSaleModal> = {
  title: "Oil Mart/Selling/RejectSaleModal",
  component: RejectSaleModal,
  args: { opened: true, saleNo: "SO-2026-000006", onClose: fn(), onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof RejectSaleModal>;

export const Default: Story = {};

export const Submitting: Story = { args: { submitting: true } };
