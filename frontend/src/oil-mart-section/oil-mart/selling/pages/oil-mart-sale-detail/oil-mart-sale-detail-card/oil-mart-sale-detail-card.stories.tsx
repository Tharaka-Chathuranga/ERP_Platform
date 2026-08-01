import type { Meta, StoryObj } from "@storybook/react";
import { oilMartSaleByStatus } from "@oilmart/mocks";
import { OilMartSaleDetailCard } from "./oil-mart-sale-detail-card";

const meta: Meta<typeof OilMartSaleDetailCard> = {
  title: "Oil Mart/Selling/OilMartSaleDetailCard",
  component: OilMartSaleDetailCard,
  args: { sale: oilMartSaleByStatus("ORDERED") },
};

export default meta;
type Story = StoryObj<typeof OilMartSaleDetailCard>;

export const Quotation: Story = { args: { sale: oilMartSaleByStatus("QUOTATION") } };
export const OrderedWithOverrides: Story = {};
export const Approved: Story = { args: { sale: oilMartSaleByStatus("APPROVED") } };
export const Dispatched: Story = { args: { sale: oilMartSaleByStatus("DISPATCHED") } };
export const Invoiced: Story = { args: { sale: oilMartSaleByStatus("INVOICED") } };
export const Rejected: Story = { args: { sale: oilMartSaleByStatus("REJECTED") } };
export const Cancelled: Story = { args: { sale: oilMartSaleByStatus("CANCELLED") } };
