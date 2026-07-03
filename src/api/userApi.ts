import type { UserResponse } from "../types/user";

export async function getUser(idToken: string): Promise<UserResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getUser`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load user.");
  }

  return data;
}