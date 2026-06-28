import { SimpleGrid } from "@mantine/core";
import { IconGasStation, IconReportMoney, IconRuler2 } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { StatCard } from "@ui/feedback/StatCard";
import { getFuelOverview } from "@fuel/fuel.api";

/** Fuel stat cards for the admin overview: today's issues, price, last reading. */
export function FuelOverviewSection() {
  const overview = useQuery({ queryKey: qk.fuelOverview(), queryFn: getFuelOverview });
  const data = overview.data;
  const reading = data?.lastInternalReading;

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
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
