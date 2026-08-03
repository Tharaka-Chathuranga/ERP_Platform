import type { Meta, StoryObj } from "@storybook/react";
import { NewOilMartQuotationPage } from "./new-oil-mart-quotation";

const meta: Meta<typeof NewOilMartQuotationPage> = {
  title: "Oil Mart/Selling/NewOilMartQuotationPage",
  component: NewOilMartQuotationPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/quotations/new" },
};

export default meta;
type Story = StoryObj<typeof NewOilMartQuotationPage>;

export const AsOilMartAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const AsStoresManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const EditingRejected: Story = {
  parameters: {
    role: "OIL_MART_ASSISTANT",
    route: "/oil-mart/quotations/quotation-rejected/edit",
    routePath: "/oil-mart/quotations/:quotationId/edit",
  },
};
