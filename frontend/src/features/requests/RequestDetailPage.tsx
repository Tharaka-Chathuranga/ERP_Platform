import { Button, Card, Group, Loader, SimpleGrid, Text } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconExternalLink, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import { useUserLabels } from "../../hooks/useLookups";
import {
  approveBorrowRequest,
  getBorrowRequest,
  rejectBorrowRequest,
} from "../../api/store/borrowRequests";
import { notifyError, notifySuccess } from "../../lib/notify";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text>{value ?? "—"}</Text>
    </div>
  );
}

export function RequestDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const userLabel = useUserLabels();

  const { data: req, isLoading } = useQuery({
    queryKey: ["borrowRequest", id],
    queryFn: () => getBorrowRequest(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["borrowRequest", id] });
    qc.invalidateQueries({ queryKey: ["borrowRequests"] });
  };

  const approve = useMutation({
    mutationFn: () => approveBorrowRequest(id, userId!),
    onSuccess: () => { notifySuccess("Approved"); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: () => rejectBorrowRequest(id, userId!),
    onSuccess: () => { notifySuccess("Rejected"); invalidate(); },
    onError: notifyError,
  });

  if (isLoading) return <Loader />;
  if (!req) return <Text>Not found.</Text>;

  return (
    <div>
      <PageHeader
        title="Borrow request"
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/requests")}
            >
              Back
            </Button>
            {isAdmin && req.status === "PENDING" && (
              <>
                <Button
                  color="green"
                  leftSection={<IconCheck size={16} />}
                  loading={approve.isPending}
                  onClick={() => approve.mutate()}
                >
                  Approve
                </Button>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconX size={16} />}
                  loading={reject.isPending}
                  onClick={() => reject.mutate()}
                >
                  Reject
                </Button>
              </>
            )}
          </Group>
        }
      />

      <Card withBorder radius="md" padding="lg">
        <SimpleGrid cols={{ base: 2, sm: 3 }} mb="md">
          <Field label="Status" value={<StatusBadge status={req.status} />} />
          <Field label="Requested by" value={userLabel(req.requestedByUserId)} />
          <Field label="Requested at" value={dayjs(req.requestedAt).format("YYYY-MM-DD HH:mm")} />
          {req.approvedByUserId && (
            <Field label="Approved by" value={userLabel(req.approvedByUserId)} />
          )}
        </SimpleGrid>
        <Field label="Reason" value={req.reason} />
        <Button
          mt="md"
          variant="subtle"
          leftSection={<IconExternalLink size={16} />}
          onClick={() => navigate(`/issuing/${req.issueId}`)}
        >
          View linked issue
        </Button>
      </Card>
    </div>
  );
}
