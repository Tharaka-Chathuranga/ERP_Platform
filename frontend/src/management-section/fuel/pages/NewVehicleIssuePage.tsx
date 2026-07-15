import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconGasStation } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StepHeading } from "@ui/layout/StepHeading";
import { UserSelect } from "@ui/primitives/UserSelect";
import { DefinitionList } from "@ui/data/DefinitionList";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createVehicleIssue, listVehicles } from "../api";

export function NewVehicleIssuePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const vehicles = useQuery({ queryKey: qk.vehicles(), queryFn: () => listVehicles() });

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [reading, setReading] = useState<number | "">("");
  const [litres, setLitres] = useState<number | "">("");
  const [odometer, setOdometer] = useState<number | "">("");
  const [receivingUserId, setReceivingUserId] = useState<string | null>(null);

  const vehicle = useMemo(
    () => vehicles.data?.content.find((v) => v.id === vehicleId) ?? null,
    [vehicles.data, vehicleId],
  );
  const capacity = vehicle?.fullTankCapacityLitres ?? 0;
  const headroom = vehicle ? Math.max(0, capacity - Number(reading || 0)) : 0;

  // Selecting a vehicle pre-fills the receiving user with its driver.
  useEffect(() => {
    setReceivingUserId(vehicle?.driverUserId ?? null);
    setReading("");
    setLitres("");
    setOdometer("");
  }, [vehicle]);

  // Default the issued litres to a full fill whenever the reading changes.
  useEffect(() => {
    if (vehicle && reading !== "") setLitres(Math.max(0, capacity - Number(reading)));
  }, [vehicle, reading, capacity]);

  const overfill = litres !== "" && Number(litres) > headroom;
  const canSubmit =
    !!vehicle && !!userId && !!receivingUserId && reading !== "" && litres !== "" &&
    Number(litres) > 0 && !overfill;

  const vehicleOptions =
    vehicles.data?.content
      .filter((v) => v.status === "ACTIVE")
      .map((v) => ({ value: v.id, label: `${v.vehicleNumber} (${v.fullTankCapacityLitres} L)` })) ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      createVehicleIssue({
        vehicleId: vehicleId!,
        vehicleReadingBeforeIssueLitres: Number(reading),
        litresIssued: Number(litres),
        issuingUserId: userId!,
        receivingUserId: receivingUserId!,
        odometerReadingKm: odometer !== "" ? Number(odometer) : undefined,
      }),
    onSuccess: () => {
      notifySuccess("Fuel issue recorded");
      qc.invalidateQueries({ queryKey: qk.vehicleIssues() });
      qc.invalidateQueries({ queryKey: qk.fuelTanks() });
      navigate("/fuel/issues");
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title="New vehicle fuel issue" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/fuel/issues")}>
          Back
        </Button>
      </Group>

      <Card withBorder radius="md" padding={0} pos="relative">
        <LoadingOverlay visible={mutation.isPending} overlayProps={{ blur: 1 }} />

        {/* Step 1 — vehicle */}
        <Box p="xl">
          <StepHeading number={1} title="Which vehicle is being fuelled?" />
          <Select
            label="Vehicle"
            placeholder="Select a vehicle"
            searchable
            data={vehicleOptions}
            value={vehicleId}
            onChange={setVehicleId}
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

        {/* Step 2 — fill */}
        <Divider />
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
                onChange={(v) => setReading(v === "" ? "" : Number(v))}
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
                onChange={(v) => setLitres(v === "" ? "" : Number(v))}
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
                onChange={(v) => setOdometer(v === "" ? "" : Number(v))}
                disabled={!vehicle}
              />
            </Grid.Col>
          </Grid>

          <UserSelect
            label="Receiving user (driver)"
            value={receivingUserId}
            onChange={setReceivingUserId}
            placeholder="Select driver"
          />

          {overfill && (
            <Alert color="red" mt="md" variant="light">
              The issued amount would overfill the vehicle. Reduce it to {headroom} L or less.
            </Alert>
          )}
        </Box>

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
    </div>
  );
}
