import { LOCAL_USER_STORAGE_KEY } from "@/lib/constants";
import { createId } from "@/lib/id";
import { isClient } from "@/lib/utils";

export function getLocalUserId() {
  if (!isClient()) {
    return "guest_server";
  }

  const cached = window.localStorage.getItem(LOCAL_USER_STORAGE_KEY);
  if (cached) {
    return cached;
  }

  const guestId = createId("guest");
  window.localStorage.setItem(LOCAL_USER_STORAGE_KEY, guestId);
  return guestId;
}

export function setLocalUserId(userId: string) {
  if (isClient()) {
    window.localStorage.setItem(LOCAL_USER_STORAGE_KEY, userId);
  }
}
