import { Alert, Center, Loader } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { apiErrorMessage } from "@core/http/client";
import { EmptyState } from "./EmptyState";

interface QueryBoundaryProps {
  loading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  empty?: ReactNode;
  children: ReactNode;
}

export function QueryBoundary({ loading, error, isEmpty, empty, children }: QueryBoundaryProps) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }
  if (error) {
    return (
      <Alert
        color="red"
        variant="light"
        radius="md"
        icon={<IconAlertTriangle size={18} />}
        title="Couldn't load this"
      >
        {apiErrorMessage(error)}
      </Alert>
    );
  }
  if (isEmpty) {
    return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  }
  return <>{children}</>;
}
