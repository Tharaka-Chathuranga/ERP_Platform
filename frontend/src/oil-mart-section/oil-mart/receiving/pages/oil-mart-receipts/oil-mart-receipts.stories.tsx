import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartReceiptsPage } from "./oil-mart-receipts";

const meta: Meta<typeof OilMartReceiptsPage> = {
  title: "Oil Mart/Receiving/OilMartReceiptsPage",
  component: OilMartReceiptsPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/receipts" },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptsPage>;

export const AsOilMartAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const AsStoresManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const NoReceipts: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/receipts", () => HttpResponse.json([]))] },
  },
};
