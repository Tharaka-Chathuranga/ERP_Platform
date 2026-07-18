import { useState } from "react";
import { Card, Group, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getEfficiencyReport } from "../../api";
import { useEfficiencyReport } from "./use-efficiency-report";
import { EfficiencyChart } from "./efficiency-chart";
import { FlaggedVehiclesCard } from "./flagged-vehicles-card";
import { SummaryTable } from "./summary-table";

export function FuelEfficiencyReportPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(29, "day").toDate(),
    dayjs().toDate(),
  ]);

  const [from, to] = range;
  const fromStr = from ? dayjs(from).format("YYYY-MM-DD") : null;
  const toStr = to ? dayjs(to).format("YYYY-MM-DD") : null;
  const ready = !!fromStr && !!toStr;

  const report = useQuery({
    queryKey: qk.fuelEfficiency(fromStr ?? "", toStr ?? ""),
    queryFn: () => getEfficiencyReport(fromStr!, toStr!),
    enabled: ready,
  });

  const userLabel = useUserLabels();
  const vehicles = report.data ?? [];
  const { chartData, summaryRows, declineRows, improveRows, vehicleDriverMap } = useEfficiencyReport(
    vehicles,
    fromStr,
    toStr,
  );

  const hasData = chartData.length > 0 && vehicles.length > 0;
  const goToVehicle = (vehicleId: string) => navigate(`/fuel/efficiency/${vehicleId}`);

  return (
    <div>
      <PageHeader title="Fleet fuel efficiency" />

      <Group mb="lg">
        <DatePickerInput
          type="range"
          placeholder="Pick date range"
          value={range}
          onChange={setRange}
          valueFormat="MMM D, YYYY"
          clearable
          w={280}
        />
      </Group>

      <Card withBorder radius="md" padding="lg" mb="lg">
        <Text fw={600} mb="md">km / L per vehicle</Text>
        {!ready && <Text c="dimmed" fz="sm" p="md">Select a date range to load the report.</Text>}
        {ready && !hasData && !report.isLoading && (
          <EmptyState
            title="No efficiency data"
            description="Record odometer readings when issuing fuel to generate this report."
          />
        )}
        {hasData && (
          <EfficiencyChart
            chartData={chartData}
            vehicles={vehicles}
            vehicleDriverMap={vehicleDriverMap}
            userLabel={userLabel}
          />
        )}
      </Card>

      {hasData && declineRows.length > 0 && (
        <FlaggedVehiclesCard tone="high" rows={declineRows} userLabel={userLabel} onRowClick={goToVehicle} />
      )}
      {hasData && improveRows.length > 0 && (
        <FlaggedVehiclesCard tone="improved" rows={improveRows} userLabel={userLabel} onRowClick={goToVehicle} />
      )}
      {hasData && (
        <SummaryTable
          rows={summaryRows}
          userLabel={userLabel}
          loading={report.isLoading}
          error={report.error}
          onRowClick={goToVehicle}
        />
      )}
    </div>
  );
}
