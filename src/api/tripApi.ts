import type { TripsResponse } from "../types/trip";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function getTrips(idToken: string): Promise<TripsResponse> {
  const response = await fetch(`${baseUrl}/trips`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load trips.");
  }

  return data;
}