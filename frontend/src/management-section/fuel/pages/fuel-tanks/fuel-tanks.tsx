import { Button } from "@mantine/core";
import { IconDroplet } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useCan } from "@auth/useCan";
import { FUEL_MANAGE, FUEL_VIEW } from "@auth/permissions";
import { EditTankModal } from "../../components/edit-tank-modal";
import { RecordReadingModal } from "../../components/record-reading-modal";
import { useFuelTanks } from "./hooks/use-fuel-tanks";
import { FuelTankCards } from "./fuel-tank-cards";
import { FuelTankHistory } from "./fuel-tank-history";

export function FuelTanksPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canManage = can(FUEL_MANAGE);
  const canRecord = can(FUEL_VIEW);

  const { tanks, readingTank, setReadingTank, editTank, setEditTank } = useFuelTanks();

  return (
    <div>
      <PageHeader
        title="Fuel tanks"
        actions={
          canRecord ? (
            <Button leftSection={<IconDroplet size={16} />} onClick={() => navigate("/fuel/deliveries/new")}>
              Record fuel delivery
            </Button>
          ) : undefined
        }
      />

      <FuelTankCards
        tanks={tanks}
        canManage={canManage}
        onEdit={setEditTank}
        onRecordReading={setReadingTank}
      />

      <FuelTankHistory tanks={tanks} />

      <RecordReadingModal opened={!!readingTank} onClose={() => setReadingTank(undefined)} tank={readingTank} />
      <EditTankModal opened={!!editTank} onClose={() => setEditTank(undefined)} tank={editTank} />
    </div>
  );
}
