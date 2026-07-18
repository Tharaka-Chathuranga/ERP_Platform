import { useParams, useNavigate } from "react-router-dom";
import { ActionIcon, Group, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconArrowLeft } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { useUserLabels } from "@core/hooks/useLookups";
import { useVehicleEfficiency } from "./hooks/use-vehicle-efficiency";
import { EfficiencyStats } from "./efficiency-stats";
import { EfficiencyChart } from "./efficiency-chart";

export function VehicleEfficiencyPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const userLabel = useUserLabels();

  const { range, setRange, vehicle, reportLoading, ready, hasData, chartData, stats } =
    useVehicleEfficiency(vehicleId);

  return (
    <div>
      <Group mb="xs" gap={4} align="center">
        <ActionIcon variant="subtle" color="gray" onClick={() => navigate("/fuel/efficiency")}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <PageHeader
          title={vehicle.data ? `${vehicle.data.vehicleNumber} — Efficiency` : "Vehicle Efficiency"}
        />
      </Group>

      {vehicle.data && (
        <Text c="dimmed" fz="sm" mb="lg">
          Driver: {userLabel(vehicle.data.driverUserId ?? "")}
        </Text>
      )}

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

      {hasData && (
        <EfficiencyStats
          avgKmL={stats.avgKmL}
          totalKm={stats.totalKm}
          totalL={stats.totalL}
          fills={stats.fills}
        />
      )}

      <EfficiencyChart chartData={chartData} ready={ready} hasData={hasData} loading={reportLoading} />
    </div>
  );
}
