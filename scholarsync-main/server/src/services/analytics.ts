import { PostHog } from "posthog-node";

const POSTHOG_KEY = process.env.POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://app.posthog.com";

let client: PostHog | null = null;

function getClient() {
  if (!POSTHOG_KEY) return null;
  if (!client) client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });
  return client;
}

export function trackEvent(
  userId: string,
  event: string,
  properties?: Record<string, any>
) {
  const ph = getClient();
  if (!ph) return;
  ph.capture({ distinctId: userId, event, properties });
}
