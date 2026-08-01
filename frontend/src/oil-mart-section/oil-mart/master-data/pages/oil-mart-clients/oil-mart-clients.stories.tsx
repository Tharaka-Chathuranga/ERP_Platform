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

export const AsStoresManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const AsOilMartAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const NoClients: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/clients", () => HttpResponse.json([]))] },
  },
};
