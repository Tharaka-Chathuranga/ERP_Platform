import { Box, Button, Card, Divider, Group, LoadingOverlay } from "@mantine/core";
import { IconChevronRight, IconGasStation } from "@tabler/icons-react";
import { useNewVehicleIssue } from "../hooks/use-new-vehicle-issue";
import { VehicleStep } from "./vehicle-step";
import { FillStep } from "./fill-step";

export function FuelIssueForm() {
  const {
    navigate,
    vehicleId,
    setVehicleId,
    reading,
    setReading,
    litres,
    setLitres,
    odometer,
    setOdometer,
    receivingUserId,
    setReceivingUserId,
    vehicle,
    capacity,
    headroom,
    overfill,
    canSubmit,
    vehicleOptions,
    mutation,
  } = useNewVehicleIssue();

  return (
    <Card withBorder radius="md" padding={0} pos="relative">
      <LoadingOverlay visible={mutation.isPending} overlayProps={{ blur: 1 }} />

      <VehicleStep
        options={vehicleOptions}
        vehicleId={vehicleId}
        onVehicleChange={setVehicleId}
        vehicle={vehicle}
        capacity={capacity}
      />

      <Divider />

      <FillStep
        vehicle={vehicle}
        capacity={capacity}
        headroom={headroom}
        reading={reading}
        onReadingChange={setReading}
        litres={litres}
        onLitresChange={setLitres}
        odometer={odometer}
        onOdometerChange={setOdometer}
        receivingUserId={receivingUserId}
        onReceivingUserChange={setReceivingUserId}
        overfill={overfill}
      />

      <Box p="xl" pt={0}>
        <Group justify="space-between">
          <Button variant="default" onClick={() => navigate("/fuel/issues")}>
            Cancel
          </Button>
          <Button
            rightSection={<IconChevronRight size={16} />}
            leftSection={<IconGasStation size={16} />}
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit}
          >
            Record issue
          </Button>
        </Group>
      </Box>
    </Card>
  );
}
