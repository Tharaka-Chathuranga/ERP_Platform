import { SimpleGrid } from "@mantine/core";
import { IconGasStation, IconReportMoney, IconRuler2, IconTruckLoading } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { StatCard } from "@ui/feedback/StatCard";
import type { FuelOverviewTank } from "@core/types";
import { getFuelOverview } from "@fuel/fuel.api";

const PURPOSE_LABEL: Record<string, string> = {
  INTERNAL: "Internal tank",
  VEHICLE: "Vehicle tank",
};

function tankValue(tank: FuelOverviewTank): string {
  const pct = tank.capacityLitres ? Math.round((tank.currentLitres / tank.capacityLitres) * 100) : 0;
  return `${tank.currentLitres} L (${pct}%)`;
}

/** Fuel figures for the admin overview: tank levels, today's issues, price, last reading. */
export function FuelOverviewSection() {
  const overview = useQuery({ queryKey: qk.fuelOverview(), queryFn: getFuelOverview });
  const data = overview.data;

  const internal = data?.tanks.find((t) => t.purpose === "INTERNAL");
  const vehicle = data?.tanks.find((t) => t.purpose === "VEHICLE");
  const reading = data?.lastInternalReading;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      <StatCard
        label={internal ? PURPOSE_LABEL.INTERNAL : "Internal tank"}
        value={internal ? tankValue(internal) : "—"}
        icon={<IconGasStation size={22} />}
        color="grape"
        to="/fuel/tanks"
        hint="Current level"
      />
      <StatCard
        label={vehicle ? PURPOSE_LABEL.VEHICLE : "Vehicle tank"}
        value={vehicle ? tankValue(vehicle) : "—"}
        icon={<IconTruckLoading size={22} />}
        color="teal"
        to="/fuel/tanks"
        hint="Current level"
      />
      <StatCard
        label="Today's vehicle fuel"
        value={data ? `${data.todayLitres} L` : "—"}
        icon={<IconGasStation size={22} />}
        color="yellow"
        to="/fuel/issues"
        hint={data ? `${data.todayIssueCount} issues today` : undefined}
      />
      <StatCard
        label="Current fuel price"
        value={data?.currentPrice ? `${data.currentPrice.unitPrice}/L` : "—"}
        icon={<IconReportMoney size={22} />}
        color="brand"
        to="/fuel/prices"
        hint={
          data?.currentPrice
            ? `Until ${dayjs(data.currentPrice.effectiveTo).format("MMM D")}`
            : "No price set"
        }
      />
      <StatCard
        label="Last internal reading"
        value={reading ? `${reading.litresMeasured} L` : "—"}
        icon={<IconRuler2 size={22} />}
        color="indigo"
        to="/fuel/tanks"
        hint={
          reading
            ? `${dayjs(reading.readingAt).format("MMM D, HH:mm")}${
                reading.consumptionSincePrevious != null
                  ? ` · used ${reading.consumptionSincePrevious} L`
                  : ""
              }`
            : "No readings"
        }
      />
    </SimpleGrid>
  );
}
