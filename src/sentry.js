import * as Sentry from "@sentry/react";
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "./utils/settings";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    environment: SENTRY_ENVIRONMENT,

    tracesSampleRate: 1.0,
  });
}
