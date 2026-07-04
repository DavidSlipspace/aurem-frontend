import type { GcProfileRequest, GcProfilesResponse } from "../types/gcProfile";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function getGcProfiles(idToken: string): Promise<GcProfilesResponse> {
  const response = await fetch(`${baseUrl}/gc-profiles`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to load GC profiles.");
  }

  return data;
}

export async function createGcProfile(
  idToken: string,
  payload: GcProfileRequest
): Promise<void> {
  const response = await fetch(`${baseUrl}/gc-profiles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to create GC profile.");
  }
}

export async function updateGcProfile(
  idToken: string,
  profileId: string,
  payload: GcProfileRequest
): Promise<void> {
  const response = await fetch(`${baseUrl}/gc-profiles/${profileId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to update GC profile.");
  }
}