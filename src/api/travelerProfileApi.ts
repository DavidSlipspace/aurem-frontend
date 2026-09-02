import type { TravelerProfileRequest, TravelerProfilesResponse } from "../types/travelerProfile";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function getTravelerProfiles(idToken: string): Promise<TravelerProfilesResponse> {
  const response = await fetch(`${baseUrl}/traveler-profiles`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load Traveler profiles.");
  }

  return data;
}

export async function createTravelerProfile(
  idToken: string,
  payload: TravelerProfileRequest
): Promise<void> {
  const response = await fetch(`${baseUrl}/traveler-profiles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to create Traveler profile.");
  }
}

export async function updateTravelerProfile(
  idToken: string,
  profileId: string,
  payload: TravelerProfileRequest
): Promise<void> {
  const response = await fetch(`${baseUrl}/traveler-profiles/${profileId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to update Traveler profile.");
  }
}