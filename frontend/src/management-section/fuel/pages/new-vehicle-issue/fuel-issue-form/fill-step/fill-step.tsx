import { Alert, Box, Grid, NumberInput } from "@mantine/core";
import { StepHeading } from "@ui/layout/StepHeading";
import { UserSelect } from "@ui/primitives/UserSelect";
import type { Vehicle } from "@core/types";

interface FillStepProps {
  vehicle: Vehicle | null;
  capacity: number;
  headroom: number;
  reading: number | "";
  onReadingChange: (value: number | "") => void;
  litres: number | "";
  onLitresChange: (value: number | "") => void;
  odometer: number | "";
  onOdometerChange: (value: number | "") => void;
  receivingUserId: string | null;
  onReceivingUserChange: (value: string | null) => void;
  overfill: boolean;
}

export function FillStep({
  vehicle,
  capacity,
  headroom,
  reading,
  onReadingChange,
  litres,
  onLitresChange,
  odometer,
  onOdometerChange,
  receivingUserId,
  onReceivingUserChange,
  overfill,
}: FillStepProps) {
  return (
    <Box p="xl">
      <StepHeading number={2} title="How much fuel is being issued?" />
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Current fuel in vehicle (L)"
            description="How much the vehicle holds right now"
            min={0}
            max={capacity || undefined}
            decimalScale={2}
            value={reading}
            onChange={(v) => onReadingChange(v === "" ? "" : Number(v))}
            disabled={!vehicle}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Litres to issue"
            description={vehicle ? `Fills up to ${headroom} L (defaults to a full tank)` : undefined}
            min={0}
            max={headroom || undefined}
            decimalScale={2}
            value={litres}
            onChange={(v) => onLitresChange(v === "" ? "" : Number(v))}
            disabled={!vehicle || reading === ""}
            error={overfill ? `Cannot exceed ${headroom} L` : undefined}
          />
        </Grid.Col>
      </Grid>

      <Grid mt="xs">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Current odometer (km)"
            description="Optional — used to calculate km per litre"
            min={0}
            decimalScale={1}
            value={odometer}
            onChange={(v) => onOdometerChange(v === "" ? "" : Number(v))}
            disabled={!vehicle}
          />
        </Grid.Col>
      </Grid>

      <UserSelect
        label="Receiving user (driver)"
        value={receivingUserId}
        onChange={onReceivingUserChange}
        placeholder="Select driver"
      />

      {overfill && (
        <Alert color="red" mt="md" variant="light">
          The issued amount would overfill the vehicle. Reduce it to {headroom} L or less.
        </Alert>
      )}
    </Box>
  );
}
