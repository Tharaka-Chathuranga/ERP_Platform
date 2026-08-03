import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartSuppliersPage } from "./oil-mart-suppliers";

const meta: Meta<typeof OilMartSuppliersPage> = {
  title: "Oil Mart/Master Data/OilMartSuppliersPage",
  component: OilMartSuppliersPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/suppliers" },
};

export default meta;
type Story = StoryObj<typeof OilMartSuppliersPage>;

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const NoSuppliers: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/suppliers", () => HttpResponse.json([]))] },
  },
};
