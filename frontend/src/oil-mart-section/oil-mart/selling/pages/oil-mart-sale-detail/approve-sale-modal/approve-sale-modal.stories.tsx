import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartSaleByStatus } from "@oilmart/mocks";
import { ApproveSaleModal } from "./approve-sale-modal";

const meta: Meta<typeof ApproveSaleModal> = {
  title: "Oil Mart/Selling/ApproveSaleModal",
  component: ApproveSaleModal,
  args: { opened: true, sale: oilMartSaleByStatus("ORDERED"), onClose: fn(), onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof ApproveSaleModal>;

export const WithPriceOverrides: Story = {};

export const NoOverrides: Story = { args: { sale: oilMartSaleByStatus("APPROVED") } };

export const Submitting: Story = { args: { submitting: true } };
