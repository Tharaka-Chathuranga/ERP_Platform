import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { DASHBOARD_ADMIN, FUEL_VIEW } from "@auth/permissions";
import {
  FuelDeliveriesPage,
  FuelEfficiencyReportPage,
  FuelPricesPage,
  FuelTanksPage,
  NewVehicleIssuePage,
  VehicleEfficiencyPage,
  VehicleIssuesPage,
  VehiclesPage,
} from "./index";

/** Fuel routes — all guarded on `fuel:view`; manage-only actions gate inside the pages. */
export const fuelRoutes = (
  <>
    <Route element={<RequirePermission perform={FUEL_VIEW} />}>
      <Route path="fuel/issues" element={<VehicleIssuesPage />} />
      <Route path="fuel/issues/new" element={<NewVehicleIssuePage />} />
      <Route path="fuel/vehicles" element={<VehiclesPage />} />
      <Route path="fuel/tanks" element={<FuelTanksPage />} />
      <Route path="fuel/deliveries" element={<FuelDeliveriesPage />} />
      <Route path="fuel/prices" element={<FuelPricesPage />} />
    </Route>
    <Route element={<RequirePermission perform={DASHBOARD_ADMIN} />}>
      <Route path="fuel/efficiency" element={<FuelEfficiencyReportPage />} />
      <Route path="fuel/efficiency/:vehicleId" element={<VehicleEfficiencyPage />} />
    </Route>
  </>
);
