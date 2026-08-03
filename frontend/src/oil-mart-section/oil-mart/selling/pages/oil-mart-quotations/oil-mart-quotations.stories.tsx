import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartQuotationsPage } from "./oil-mart-quotations";

const meta: Meta<typeof OilMartQuotationsPage> = {
  title: "Oil Mart/Selling/OilMartQuotationsPage",
  component: OilMartQuotationsPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/quotations" },
};

export default meta;
type Story = StoryObj<typeof OilMartQuotationsPage>;

export const AsOilMartAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const AsStoresManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const EmptyBoardAsAssistant: Story = {
  parameters: {
    role: "OIL_MART_ASSISTANT",
    msw: { handlers: [http.get("/api/oilmart/quotations", () => HttpResponse.json([]))] },
  },
};

export const ApprovalRejectedByBackend: Story = {
  parameters: {
    role: "STORES_MANAGER",
    msw: {
      handlers: [
        http.post("/api/oilmart/quotations/:quotationId/approve", () =>
          HttpResponse.json(
            {
              detail:
                "QT-26-07-014 was changed by someone else since you loaded it — reload and try again",
              code: "OILMART_QUOTATION_MODIFIED",
            },
            { status: 409 },
          ),
        ),
      ],
    },
  },
};
