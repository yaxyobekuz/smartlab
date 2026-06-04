// Static role values (stored as-is in the DB).
// Only `owner` is hard-coded. Other roles come from the DB dynamically.
export const ROLES = Object.freeze({
  OWNER: "owner",
});

export const ROLE_LABELS = Object.freeze({
  owner: "Ega",
});

export const ALL_ROLES = Object.values(ROLES);

// Default landing route per role. Dynamic roles fall back to `/`.
export const ROLE_HOME = Object.freeze({
  owner: "/owner",
});
