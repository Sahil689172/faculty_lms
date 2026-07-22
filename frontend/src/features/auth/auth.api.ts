import { apiClient, setToken } from "../../lib/apiClient";

export interface Faculty {
  id: string;
  name: string;
  email: string;
}

interface LoginResponseData {
  accessToken: string;
  faculty: Faculty;
}

export async function loginRequest(email: string, password: string): Promise<Faculty> {
  const { data } = await apiClient.post<{ data: LoginResponseData }>("/auth/login", {
    email,
    password,
  });

  setToken(data.data.accessToken);
  return data.data.faculty;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<Faculty> {
  const { data } = await apiClient.post<{ data: LoginResponseData }>("/auth/register", {
    name,
    email,
    password,
  });

  setToken(data.data.accessToken);
  return data.data.faculty;
}

export async function fetchMe(): Promise<Faculty> {
  const { data } = await apiClient.get<{ data: Faculty }>("/auth/me");
  return data.data;
}
