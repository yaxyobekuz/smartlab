export const getRoleLabel = (roleValue, roles = []) => {
  if (roleValue === "owner") return "Ega";
  const found = roles.find((r) => r.value === roleValue);
  return found ? found.name : roleValue;
};

export const isRoleAllowed = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Owner is excluded — it cannot be assigned via the UI
export const getAllRoles = (roles = []) =>
  roles
    .filter((r) => r.value !== "owner")
    .map((r) => ({ value: r.value, label: r.name }));
