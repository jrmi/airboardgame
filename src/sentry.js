import * as Sentry from "@sentry/react";
import { SENTRY_DSN, SENTRY_ENVIRONMENT } from "./utils/settings";

let sentryInitialized = false;

export const initSentry = () => {
  if (!SENTRY_DSN || sentryInitialized) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    environment: SENTRY_ENVIRONMENT,

    tracesSampleRate: 1.0,
  });
  sentryInitialized = true;
};
