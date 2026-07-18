import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createVehicleIssue, listVehicles } from "../../../../api";

export function useNewVehicleIssue() {
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

  return {
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
  };
}
