import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartSalesPage } from "./oil-mart-sales";

const meta: Meta<typeof OilMartSalesPage> = {
  title: "Oil Mart/Selling/OilMartSalesPage",
  component: OilMartSalesPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/sales" },
};

export default meta;
type Story = StoryObj<typeof OilMartSalesPage>;

export const AsOilMartAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const AsStoresManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const NoSales: Story = {
  parameters: { msw: { handlers: [http.get("/api/oilmart/sales", () => HttpResponse.json([]))] } },
};
