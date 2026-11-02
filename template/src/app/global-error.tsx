"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Last-resort error screen. The customer sees a calm message;
// you get the full error in Sentry.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 48 }}>
        <h1>Something went wrong</h1>
        <p>We&apos;ve been notified and are looking into it. Please try again.</p>
      </body>
    </html>
  );
}
