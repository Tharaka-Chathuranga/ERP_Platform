import { Box, Card, Select } from "@mantine/core";
import { StepHeading } from "@ui/layout/StepHeading";
import { DefinitionList } from "@ui/data/DefinitionList";
import type { Vehicle } from "@core/types";

interface VehicleStepProps {
  options: { value: string; label: string }[];
  vehicleId: string | null;
  onVehicleChange: (value: string | null) => void;
  vehicle: Vehicle | null;
  capacity: number;
}

export function VehicleStep({ options, vehicleId, onVehicleChange, vehicle, capacity }: VehicleStepProps) {
  return (
    <Box p="xl">
      <StepHeading number={1} title="Which vehicle is being fuelled?" />
      <Select
        label="Vehicle"
        placeholder="Select a vehicle"
        searchable
        data={options}
        value={vehicleId}
        onChange={onVehicleChange}
        nothingFoundMessage="No vehicles"
        comboboxProps={{ withinPortal: true }}
      />
      {vehicle && (
        <Card withBorder radius="md" padding="sm" mt="md" bg="var(--mantine-color-brand-light)">
          <DefinitionList
            items={[
              { label: "Vehicle", value: vehicle.vehicleNumber },
              { label: "Tank capacity", value: `${capacity} L` },
              { label: "Description", value: vehicle.description || "—" },
            ]}
          />
        </Card>
      )}
    </Box>
  );
}
