import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { anOilMartStockBalance, oilMartMovements } from "@oilmart/mocks";
import { OilMartMovementDrawer } from "./oil-mart-movement-drawer";

const meta: Meta<typeof OilMartMovementDrawer> = {
  title: "Oil Mart/Stock/OilMartMovementDrawer",
  component: OilMartMovementDrawer,
  args: {
    balance: anOilMartStockBalance(),
    movements: oilMartMovements,
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OilMartMovementDrawer>;

export const FullLedger: Story = {};

export const Loading: Story = { args: { movements: [], loading: true } };

export const NoMovements: Story = { args: { movements: [] } };

export const LoadFailed: Story = {
  args: { movements: [], error: new globalThis.Error("Ledger unavailable") },
};

export const Closed: Story = { args: { balance: null } };
