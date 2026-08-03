import type { Meta, StoryObj } from "@storybook/react";
import { NewOilMartQuotationPage } from "./new-oil-mart-quotation";

const meta: Meta<typeof NewOilMartQuotationPage> = {
  title: "Oil Mart/Selling/NewOilMartQuotationPage",
  component: NewOilMartQuotationPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/quotations/new" },
};

export default meta;
type Story = StoryObj<typeof NewOilMartQuotationPage>;

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const EditingRejected: Story = {
  parameters: {
    role: "OIL_MART_SALES_ASSISTANT",
    route: "/oil-mart/quotations/quotation-rejected/edit",
    routePath: "/oil-mart/quotations/:quotationId/edit",
  },
};
