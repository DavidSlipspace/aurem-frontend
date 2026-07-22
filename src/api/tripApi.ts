import type {
  TripRequest,
  TripsResponse
} from "../types/trip";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function getErrorMessage(
  data: unknown,
  fallbackMessage: string
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallbackMessage;
}

async function parseResponseBody(
  response: Response
): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text ? { message: text } : {};
}

export async function getTrips(
  idToken: string
): Promise<TripsResponse> {
  const response = await fetch(`${baseUrl}/trips`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Unable to load trips.")
    );
  }

  return data as TripsResponse;
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

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Unable to create trip.")
    );
  }
}

export async function updateTrip(
  idToken: string,
  tripId: string,
  payload: TripRequest
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/trips/${tripId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Unable to update trip.")
    );
  }
}