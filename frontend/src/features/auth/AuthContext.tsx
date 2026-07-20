import { useEffect, useMemo, useState, type ReactNode } from "react";
import { clearToken, getToken } from "../../lib/apiClient";
import { fetchMe, loginRequest, type Faculty } from "./auth.api";
import { AuthContext, type AuthStatus } from "./auth.context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!getToken()) {
      setStatus("unauthenticated");
      return;
    }

    fetchMe()
      .then((profile) => {
        setFaculty(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        clearToken();
        setFaculty(null);
        setStatus("unauthenticated");
      });
  }, []);

  const value = useMemo(
    () => ({
      faculty,
      status,
      login: async (email: string, password: string) => {
        const profile = await loginRequest(email, password);
        setFaculty(profile);
        setStatus("authenticated");
      },
      logout: () => {
        clearToken();
        setFaculty(null);
        setStatus("unauthenticated");
      },
    }),
    [faculty, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
