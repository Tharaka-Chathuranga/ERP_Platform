import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { FuelTank } from "@core/types";
import { listTanks, recordFuelDelivery, type FuelDeliveryLineInput } from "../../api";

interface RecordFuelDeliveryModalProps {
  opened: boolean;
  onClose: () => void;
}

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
export function RecordFuelDeliveryModal({ opened, onClose }: RecordFuelDeliveryModalProps) {
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

  useEffect(() => {
    if (opened) {
      setSupplierName("Toboi Stores & Supply");
      setOrderedLitres("");
      setDeliveredOn(new Date());
      setDischargeStart("");
      setDischargeFinish("");
      setNote("");
      setLines({});
    }
  }, [opened]);

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
      onClose();
    },
    onError: notifyError,
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Record fuel delivery"
      centered
      size="lg"
      styles={{ title: { fontSize: "var(--mantine-font-size-xl)", fontWeight: 700 } }}
    >
      <Stack>
        <TextInput
          label="Supplier"
          value={supplierName}
          onChange={(e) => setSupplierName(e.currentTarget.value)}
        />
        <Group grow>
          <DatePickerInput
            label="Delivery date"
            value={deliveredOn}
            onChange={setDeliveredOn}
            valueFormat="MMM D, YYYY"
            defaultDate={new Date()}
            required
          />
          <NumberInput
            label="Ordered (L)"
            min={0}
            decimalScale={2}
            value={orderedLitres}
            onChange={(v) => setOrderedLitres(v === "" ? "" : Number(v))}
            required
          />
        </Group>
        <Group grow>
          <TimeInput
            label="Discharge start"
            value={dischargeStart}
            onChange={(e) => setDischargeStart(e.currentTarget.value)}
          />
          <TimeInput
            label="Discharge finish"
            value={dischargeFinish}
            onChange={(e) => setDischargeFinish(e.currentTarget.value)}
            error={dischargeOutOfOrder ? "Finish is before start" : undefined}
          />
        </Group>

        <Divider label="Tanks discharged into" labelPosition="left" />
        <Text c="dimmed" fz="xs" mt={-8}>
          Enter delivered litres for each tank that received fuel. Leave a tank at 0 if not applicable.
        </Text>

        {activeTanks.map((tank) => (
          <TankLineEditor
            key={tank.id}
            tank={tank}
            line={lineOf(tank.id)}
            onChange={(field, value) => setLineField(tank.id, field, value)}
          />
        ))}

        <Divider />
        <Group justify="space-between">
          <Text fw={600}>Total delivered</Text>
          <Text fw={700}>{totalDelivered.toLocaleString()} L</Text>
        </Group>
        {orderedVsDelivered !== null && (
          <Group justify="space-between">
            <Text c="dimmed" fz="sm">Ordered vs delivered</Text>
            <VarianceText value={orderedVsDelivered} unit="L" />
          </Group>
        )}

        <Textarea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <Group justify="space-between">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!valid} onClick={() => mutation.mutate()}>
            Record delivery
          </Button>
        </Group>
      </Stack>
    </Modal>
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
  const delivered = Number(line.litresDelivered) || 0;
  const hasDips = line.dipBeforeLitres !== "" && line.dipAfterLitres !== "";
  const dipVariance = hasDips
    ? Number(line.dipAfterLitres) - Number(line.dipBeforeLitres) - delivered
    : null;

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="xs">
        <Text fw={600}>{tank.name}</Text>
        <Badge variant="light" color={tank.purpose === "INTERNAL" ? "grape" : "teal"} radius="sm">
          {PURPOSE_LABEL[tank.purpose] ?? tank.purpose}
        </Badge>
      </Group>
      <Stack gap="xs">
        <NumberInput
          label="Delivered (L)"
          min={0}
          decimalScale={2}
          value={line.litresDelivered}
          onChange={(v) => onChange("litresDelivered", v === "" ? "" : Number(v))}
        />
        <Group grow>
          <NumberInput
            label="Dip before (L)"
            min={0}
            decimalScale={2}
            value={line.dipBeforeLitres}
            onChange={(v) => onChange("dipBeforeLitres", v === "" ? "" : Number(v))}
          />
          <NumberInput
            label="Dip after (L)"
            min={0}
            decimalScale={2}
            value={line.dipAfterLitres}
            onChange={(v) => onChange("dipAfterLitres", v === "" ? "" : Number(v))}
          />
        </Group>
        {dipVariance !== null && delivered > 0 && (
          <Group gap="xs">
            <Text c="dimmed" fz="xs">Dip reconciliation</Text>
            <VarianceText value={dipVariance} unit="L" small tolerance={0.5} />
          </Group>
        )}
      </Stack>
    </Card>
  );
}

/** Signed variance with a colour + reconciliation icon; green when within tolerance. */
function VarianceText({
  value,
  unit,
  small,
  tolerance = 0,
}: {
  value: number;
  unit: string;
  small?: boolean;
  tolerance?: number;
}) {
  const ok = Math.abs(value) <= tolerance;
  const sign = value > 0 ? "+" : "";
  const color = ok ? "teal" : Math.abs(value) > 0 ? "orange" : "gray";
  return (
    <Text fw={600} fz={small ? "xs" : "sm"} c={color}>
      {ok ? "✓ balanced" : `${sign}${value.toLocaleString()} ${unit}`}
    </Text>
  );
}
