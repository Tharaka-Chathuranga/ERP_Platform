import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { NewOilMartInvoicePage } from "./new-oil-mart-invoice";

const meta: Meta<typeof NewOilMartInvoicePage> = {
  title: "Oil Mart/Selling/NewOilMartInvoicePage",
  component: NewOilMartInvoicePage,
  parameters: { layout: "fullscreen", route: "/oil-mart/invoices/new" },
};

export default meta;
type Story = StoryObj<typeof NewOilMartInvoicePage>;

export const AsOilMartAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const NothingToInvoice: Story = {
  parameters: {
    role: "OIL_MART_ASSISTANT",
    msw: {
      handlers: [
        http.get("/api/oilmart/invoices/invoiceable-quotations", () => HttpResponse.json([])),
      ],
    },
  },
};
