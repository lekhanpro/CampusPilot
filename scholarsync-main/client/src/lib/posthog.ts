import posthog from "posthog-js";

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://app.posthog.com";

export function initPosthog() {
  if (!key) return;
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: "localStorage",
  });
}

export function capture(event: string, properties?: Record<string, any>) {
  if (!key) return;
  posthog.capture(event, properties);
}
