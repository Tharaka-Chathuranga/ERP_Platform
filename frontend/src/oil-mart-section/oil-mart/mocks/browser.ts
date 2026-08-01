import { setupWorker } from "msw/browser";
import { oilMartHandlers } from "./handlers";

export const oilMartWorker = setupWorker(...oilMartHandlers);

export async function startOilMartMocks() {
  await oilMartWorker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
