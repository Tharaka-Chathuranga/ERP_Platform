import { Navigate } from "react-router-dom";
import { Alert, Center } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useLandingRoute } from "@auth/useLandingRoute";

export function DashboardPage() {
  const landingRoute = useLandingRoute();

  if (landingRoute) return <Navigate to={landingRoute} replace />;

  return (
    <Center h="60vh">
      <Alert icon={<IconLock size={18} />} color="gray" title="No sections available" maw={420}>
        Your role has no sections assigned yet. Contact an administrator to get access.
      </Alert>
    </Center>
  );
}
