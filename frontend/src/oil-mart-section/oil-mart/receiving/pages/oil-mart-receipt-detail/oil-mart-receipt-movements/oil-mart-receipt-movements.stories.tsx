import type { Meta, StoryObj } from "@storybook/react";
import { oilMartItems, oilMartMovements } from "@oilmart/mocks";
import { OilMartReceiptMovements } from "./oil-mart-receipt-movements";

const itemNameById = new Map(oilMartItems.map((item) => [item.id, item.name]));

const meta: Meta<typeof OilMartReceiptMovements> = {
  title: "Oil Mart/Receiving/OilMartReceiptMovements",
  component: OilMartReceiptMovements,
  args: {
    movements: oilMartMovements.filter((m) => m.referenceId === "rcp-1"),
    itemNameById,
  },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptMovements>;

export const Populated: Story = {};

export const Loading: Story = { args: { movements: [], loading: true } };

export const Empty: Story = { args: { movements: [] } };
