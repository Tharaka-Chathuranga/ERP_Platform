import { Alert, Button, Center, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@core/http/client";

interface PdfPreviewModalProps {
  opened: boolean;
  /** API path, e.g. /oilmart/quotations/{id}/pdf */
  path?: string;
  documentNo?: string;
  onClose: () => void;
}

export function PdfPreviewModal({ opened, path, documentNo, onClose }: PdfPreviewModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !path) return;

    let revoked = false;
    let created: string | null = null;
    setError(null);
    setObjectUrl(null);

    api
      .get<Blob>(path, { responseType: "blob" })
      .then((response) => {
        if (revoked) return;
        created = URL.createObjectURL(response.data);
        setObjectUrl(created);
      })
      .catch((failure) => {
        if (!revoked) setError(apiErrorMessage(failure));
      });

    return () => {
      revoked = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [opened, path]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={documentNo ? `${documentNo} — client copy` : "Document preview"}
      centered
      size="xl"
    >
      <Stack gap="md">
        <Text size="xs" c="dimmed">
          This is exactly what the client receives. Cost and profit never appear on it.
        </Text>

        {error ? (
          <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />}>
            {error}
          </Alert>
        ) : objectUrl ? (
          <iframe
            title={documentNo ?? "Document preview"}
            src={objectUrl}
            style={{ width: "100%", height: "70vh", border: "1px solid var(--mantine-color-gray-3)" }}
          />
        ) : (
          <Center h="70vh">
            <Loader />
          </Center>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
          {objectUrl && (
            <Button
              component="a"
              href={objectUrl}
              download={`${documentNo ?? "document"}.pdf`}
              leftSection={<IconDownload size={16} />}
            >
              Download
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
