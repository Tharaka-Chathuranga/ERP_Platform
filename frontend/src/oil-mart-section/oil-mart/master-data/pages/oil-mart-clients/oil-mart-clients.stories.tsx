import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartClientsPage } from "./oil-mart-clients";

const meta: Meta<typeof OilMartClientsPage> = {
  title: "Oil Mart/Master Data/OilMartClientsPage",
  component: OilMartClientsPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/clients" },
};

export default meta;
type Story = StoryObj<typeof OilMartClientsPage>;

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const NoClients: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/clients", () => HttpResponse.json([]))] },
  },
};
