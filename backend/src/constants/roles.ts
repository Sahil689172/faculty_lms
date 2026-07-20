export const Roles = {
  FACULTY: "FACULTY",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
