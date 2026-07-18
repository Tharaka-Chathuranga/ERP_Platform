import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import {
  IconCalendar,
  IconClock,
  IconDropletFilled,
  IconGasStation,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { StepHeading } from "@ui/layout/StepHeading";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { FuelTank } from "@core/types";
import { listTanks, recordFuelDelivery, type FuelDeliveryLineInput } from "../../../api";

/** Per-tank editable line: litres discharged plus the before/after dip readings. */
interface LineDraft {
  litresDelivered: number | "";
  dipBeforeLitres: number | "";
  dipAfterLitres: number | "";
}

const EMPTY_LINE: LineDraft = { litresDelivered: "", dipBeforeLitres: "", dipAfterLitres: "" };

/** Combine the delivery date with an "HH:mm" time into an ISO instant, or undefined. */
function toInstant(date: Date | null, time: string): string | undefined {
  if (!date || !time) return undefined;
  return dayjs(`${dayjs(date).format("YYYY-MM-DD")}T${time}`).toISOString();
}

function num(value: number | ""): number | undefined {
  return value === "" ? undefined : Number(value);
}

/**
 * Record a supplier fuel delivery the way the station logs it on paper: ordered
 * vs delivered litres, discharge timing, and a per-tank line carrying the dip
 * readings before and after discharge, with the reconciliation shown live.
 */
export function FuelDeliveryForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();
  const tanksQuery = useQuery({ queryKey: qk.fuelTanks(), queryFn: listTanks });
  const activeTanks = useMemo(
    () => (tanksQuery.data ?? []).filter((t) => t.status === "ACTIVE"),
    [tanksQuery.data],
  );

  const [supplierName, setSupplierName] = useState("Toboi Stores & Supply");
  const [orderedLitres, setOrderedLitres] = useState<number | "">("");
  const [deliveredOn, setDeliveredOn] = useState<Date | null>(new Date());
  const [dischargeStart, setDischargeStart] = useState("");
  const [dischargeFinish, setDischargeFinish] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Record<string, LineDraft>>({});

  const lineOf = (tankId: string): LineDraft => lines[tankId] ?? EMPTY_LINE;
  const setLineField = (tankId: string, field: keyof LineDraft, value: number | "") =>
    setLines((prev) => ({ ...prev, [tankId]: { ...(prev[tankId] ?? EMPTY_LINE), [field]: value } }));

  const activeLines = useMemo(
    () => activeTanks.filter((t) => Number(lineOf(t.id).litresDelivered) > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTanks, lines],
  );

  const totalDelivered = activeLines.reduce((sum, t) => sum + Number(lineOf(t.id).litresDelivered), 0);
  const orderedVsDelivered = orderedLitres === "" ? null : totalDelivered - Number(orderedLitres);

  const dischargeOutOfOrder =
    !!dischargeStart && !!dischargeFinish && dischargeFinish < dischargeStart;

  const valid =
    !!userId &&
    orderedLitres !== "" &&
    Number(orderedLitres) > 0 &&
    !!deliveredOn &&
    activeLines.length > 0 &&
    !dischargeOutOfOrder;

  const mutation = useMutation({
    mutationFn: () => {
      const payloadLines: FuelDeliveryLineInput[] = activeLines.map((t) => {
        const line = lineOf(t.id);
        return {
          tankId: t.id,
          litresDelivered: Number(line.litresDelivered),
          dipBeforeLitres: num(line.dipBeforeLitres),
          dipAfterLitres: num(line.dipAfterLitres),
        };
      });
      return recordFuelDelivery({
        supplierName: supplierName.trim() || undefined,
        orderedLitres: Number(orderedLitres),
        deliveredOn: dayjs(deliveredOn).format("YYYY-MM-DD"),
        dischargeStartedAt: toInstant(deliveredOn, dischargeStart),
        dischargeFinishedAt: toInstant(deliveredOn, dischargeFinish),
        recordedByUserId: userId!,
        note: note.trim() || undefined,
        lines: payloadLines,
      });
    },
    onSuccess: () => {
      notifySuccess("Fuel delivery recorded");
      qc.invalidateQueries({ queryKey: qk.fuelDeliveries() });
      qc.invalidateQueries({ queryKey: qk.fuelTanks() });
      qc.invalidateQueries({ queryKey: qk.fuelOverview() });
      navigate("/fuel/deliveries");
    },
    onError: notifyError,
  });

  return (
    <Card withBorder radius="md" padding={0} pos="relative">
      <LoadingOverlay visible={mutation.isPending} overlayProps={{ blur: 1 }} />

      <Box p="xl">
        <StepHeading number={1} title="Delivery details" />
        <Grid gutter="md">
          <Grid.Col span={12}>
            <TextInput
              label="Supplier"
              description="Who supplied and discharged the fuel"
              leftSection={<IconTruckDelivery size={16} />}
              value={supplierName}
              onChange={(e) => setSupplierName(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              label="Delivery date"
              description="Date the delivery was received"
              leftSection={<IconCalendar size={16} />}
              value={deliveredOn}
              onChange={setDeliveredOn}
              valueFormat="MMM D, YYYY"
              defaultDate={new Date()}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label="Ordered (L)"
              description="Litres ordered from the supplier"
              leftSection={<IconDropletFilled size={16} />}
              min={0}
              decimalScale={2}
              thousandSeparator=","
              value={orderedLitres}
              onChange={(v) => setOrderedLitres(v === "" ? "" : Number(v))}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TimeInput
              label="Discharge start"
              description="When discharge into the tanks began"
              leftSection={<IconClock size={16} />}
              value={dischargeStart}
              onChange={(e) => setDischargeStart(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TimeInput
              label="Discharge finish"
              description="When discharge finished"
              leftSection={<IconClock size={16} />}
              value={dischargeFinish}
              onChange={(e) => setDischargeFinish(e.currentTarget.value)}
              error={dischargeOutOfOrder ? "Finish is before start" : undefined}
            />
          </Grid.Col>
        </Grid>
      </Box>

      <Divider />

      <Box p="xl">
        <StepHeading number={2} title="Tanks discharged into" />
        <Text c="dimmed" fz="sm" mb="md">
          Enter delivered litres for each tank that received fuel. Leave a tank at 0 if not applicable.
        </Text>

        <Stack gap="md">
          {activeTanks.map((tank) => (
            <TankLineEditor
              key={tank.id}
              tank={tank}
              line={lineOf(tank.id)}
              onChange={(field, value) => setLineField(tank.id, field, value)}
            />
          ))}
        </Stack>

        <Card withBorder radius="md" padding="lg" mt="lg" bg="var(--mantine-color-brand-light)">
          <Group justify="space-between" align="flex-end">
            <div>
              <Text fz="xs" tt="uppercase" fw={600} c="dimmed">
                Total delivered
              </Text>
              <Text fz={28} fw={700} lh={1.1}>
                {totalDelivered.toLocaleString()}
                <Text component="span" fz="md" fw={500} c="dimmed" ml={6}>
                  L
                </Text>
              </Text>
            </div>
            {orderedVsDelivered !== null && (
              <div style={{ textAlign: "right" }}>
                <Text fz="xs" tt="uppercase" fw={600} c="dimmed">
                  Ordered vs delivered
                </Text>
                <VarianceText value={orderedVsDelivered} unit="L" large />
              </div>
            )}
          </Group>
        </Card>

        <Textarea
          label="Note"
          description="Anything worth recording about this delivery"
          mt="md"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          autosize
          minRows={2}
        />
      </Box>

      <Divider />

      <Box p="xl">
        <Group justify="space-between">
          <Button variant="default" onClick={() => navigate("/fuel/deliveries")}>
            Cancel
          </Button>
          <Button
            leftSection={<IconGasStation size={16} />}
            loading={mutation.isPending}
            disabled={!valid}
            onClick={() => mutation.mutate()}
          >
            Record delivery
          </Button>
        </Group>
      </Box>
    </Card>
  );
}

const PURPOSE_LABEL: Record<string, string> = { INTERNAL: "Big / internal", VEHICLE: "Small / vehicle" };

/** One tank's delivered litres + dip readings, with a live reconciliation line. */
function TankLineEditor({
  tank,
  line,
  onChange,
}: {
  tank: FuelTank;
  line: LineDraft;
  onChange: (field: keyof LineDraft, value: number | "") => void;
}) {
  const isInternal = tank.purpose === "INTERNAL";
  const delivered = Number(line.litresDelivered) || 0;
  const hasDips = line.dipBeforeLitres !== "" && line.dipAfterLitres !== "";
  const dipVariance = hasDips
    ? Number(line.dipAfterLitres) - Number(line.dipBeforeLitres) - delivered
    : null;

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <ThemeIcon variant="light" color={isInternal ? "grape" : "teal"} radius="md" size="lg">
            <IconGasStation size={18} />
          </ThemeIcon>
          <Text fw={600}>{tank.name}</Text>
        </Group>
        <Badge variant="light" color={isInternal ? "grape" : "teal"} radius="sm">
          {PURPOSE_LABEL[tank.purpose] ?? tank.purpose}
        </Badge>
      </Group>
      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <NumberInput
            label="Delivered (L)"
            min={0}
            decimalScale={2}
            thousandSeparator=","
            value={line.litresDelivered}
            onChange={(v) => onChange("litresDelivered", v === "" ? "" : Number(v))}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <NumberInput
            label="Dip before (L)"
            min={0}
            decimalScale={2}
            thousandSeparator=","
            value={line.dipBeforeLitres}
            onChange={(v) => onChange("dipBeforeLitres", v === "" ? "" : Number(v))}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <NumberInput
            label="Dip after (L)"
            min={0}
            decimalScale={2}
            thousandSeparator=","
            value={line.dipAfterLitres}
            onChange={(v) => onChange("dipAfterLitres", v === "" ? "" : Number(v))}
          />
        </Grid.Col>
      </Grid>
      {dipVariance !== null && delivered > 0 && (
        <Group gap="xs" mt="sm">
          <Text c="dimmed" fz="xs">Dip reconciliation</Text>
          <VarianceText value={dipVariance} unit="L" small tolerance={0.5} />
        </Group>
      )}
    </Card>
  );
}

/** Signed variance with a colour cue; green when within tolerance. */
function VarianceText({
  value,
  unit,
  small,
  large,
  tolerance = 0,
}: {
  value: number;
  unit: string;
  small?: boolean;
  large?: boolean;
  tolerance?: number;
}) {
  const ok = Math.abs(value) <= tolerance;
  const sign = value > 0 ? "+" : "";
  const color = ok ? "teal" : Math.abs(value) > 0 ? "orange" : "gray";
  const fz = large ? "xl" : small ? "xs" : "sm";
  return (
    <Text fw={700} fz={fz} c={color}>
      {ok ? "✓ balanced" : `${sign}${value.toLocaleString()} ${unit}`}
    </Text>
  );
}
