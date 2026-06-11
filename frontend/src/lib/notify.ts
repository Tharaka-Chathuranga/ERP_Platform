import { notifications } from "@mantine/notifications";
import { apiErrorMessage } from "../api/client";

export function notifySuccess(message: string, title = "Success") {
  notifications.show({ title, message, color: "green" });
}

// Single-arg on purpose: passing a 2-arg function directly to react-query's
// `onError` makes it infer the mutation's variables type from the 2nd param.
export function notifyError(error: unknown) {
  notifications.show({ title: "Something went wrong", message: apiErrorMessage(error), color: "red" });
}
