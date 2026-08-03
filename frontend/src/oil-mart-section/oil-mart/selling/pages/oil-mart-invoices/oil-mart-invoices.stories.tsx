import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartInvoicesPage } from "./oil-mart-invoices";

const meta: Meta<typeof OilMartInvoicesPage> = {
  title: "Oil Mart/Selling/OilMartInvoicesPage",
  component: OilMartInvoicesPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/invoices" },
};

export default meta;
type Story = StoryObj<typeof OilMartInvoicesPage>;

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const Empty: Story = {
  parameters: {
    role: "OIL_MART_SALES_ASSISTANT",
    msw: { handlers: [http.get("/api/oilmart/invoices", () => HttpResponse.json([]))] },
  },
};
