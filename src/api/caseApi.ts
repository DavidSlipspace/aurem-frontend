import type { CasesResponse } from "../types/case";

export async function getCases(idToken: string): Promise<CasesResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cases`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load cases.");
  }

  return data;
}