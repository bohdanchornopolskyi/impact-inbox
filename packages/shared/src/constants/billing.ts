const PLAN_TIERS = ["starter", "growth", "agency"] as const;

const PLAN_LIMITS = {
  starter: {
    contactCap: 500,
    sendQuota: 5_000,
    workspaces: 1,
    adminSeats: 2,
  },
  growth: {
    contactCap: 2_500,
    sendQuota: 25_000,
    workspaces: 3,
    adminSeats: 5,
  },
  agency: {
    contactCap: 10_000,
    sendQuota: 100_000,
    workspaces: 10,
    adminSeats: 15,
  },
} as const;

const SEND_TOP_UP_PACKS = {
  small: 5_000,
  large: 25_000,
} as const;

export { PLAN_TIERS, PLAN_LIMITS, SEND_TOP_UP_PACKS };
