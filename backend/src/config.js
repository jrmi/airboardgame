export const SITE_PREFIX = "airboardgame";

// RICOCHET_SECRET is kept as a migration fallback for existing deployments.
export const sessionSecret = () =>
  process.env.ABG_SECRET || process.env.RICOCHET_SECRET || "development-secret";
