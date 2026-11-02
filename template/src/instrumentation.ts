import * as Sentry from "@sentry/nextjs";

// Runs once when the server starts. Errors on the server get sent to Sentry.
export async function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    tracesSampleRate: 0.1,
    // Don't ship customers' personal data to a third party by default.
    dataCollection: { userInfo: false, cookies: false, httpBodies: [] },
  });
}

export const onRequestError = Sentry.captureRequestError;
