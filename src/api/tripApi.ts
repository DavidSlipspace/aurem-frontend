import type {
  TripRequest,
  TripsResponse
} from "../types/trip";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function getTrips(
  idToken: string
): Promise<TripsResponse> {
  const response = await fetch(`${baseUrl}/trips`, {
    method: "GET",
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

export async function createTrip(
  idToken: string,
  payload: TripRequest
): Promise<void> {
  const response = await fetch(`${baseUrl}/trips`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to create trip.");
  }
}

export async function updateTrip(
  idToken: string,
  tripId: string,
  payload: TripRequest
): Promise<void> {
  const response = await fetch(`${baseUrl}/trips/${tripId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to update trip.");
  }
}