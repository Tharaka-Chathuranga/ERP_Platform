import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { http, HttpResponse } from "msw";
import { PdfPreviewModal } from "./pdf-preview-modal";

const meta: Meta<typeof PdfPreviewModal> = {
  title: "Oil Mart/Selling/PdfPreviewModal",
  component: PdfPreviewModal,
  args: {
    opened: true,
    path: "/oilmart/quotations/quotation-draft/pdf",
    documentNo: "QT-26-07-012",
    onClose: fn(),
  },
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PdfPreviewModal>;

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/quotations/:quotationId/pdf", () => new Promise(() => {})),
      ],
    },
  },
};

export const Failed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/quotations/:quotationId/pdf", () =>
          HttpResponse.json({ detail: "Could not render the PDF for QT-26-07-012" }, { status: 500 }),
        ),
      ],
    },
  },
};
