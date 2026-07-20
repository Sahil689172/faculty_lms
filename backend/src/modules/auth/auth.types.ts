import type { Role } from "../../constants/roles.js";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface PublicFaculty {
  id: string;
  name: string;
  email: string;
}
