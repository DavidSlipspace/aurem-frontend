import type {
  CaseBudgetRequest,
  CaseBudgetResponse,
  CaseMutationResponse,
  CaseOptionsResponse,
  CaseRequest,
  CasesResponse
} from "../types/case";

const baseUrl =
  import.meta.env
    .VITE_API_BASE_URL;

function getErrorMessage(
  data: unknown,
  fallbackMessage: string
): string {
  if (
    typeof data ===
      "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message ===
      "string"
  ) {
    return data.message;
  }

  return fallbackMessage;
}

async function parseResponseBody(
  response: Response
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  return text
    ? {
        message: text
      }
    : {};
}

export async function getCases(
  idToken: string
): Promise<CasesResponse> {
  const response =
    await fetch(
      `${baseUrl}/cases`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${idToken}`
        }
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to load cases."
      )
    );
  }

  return data as CasesResponse;
}

export async function getCaseOptions(
  idToken: string
): Promise<CaseOptionsResponse> {
  const response =
    await fetch(
      `${baseUrl}/cases/options`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${idToken}`
        }
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to load case assignment options."
      )
    );
  }

  return (
    data as
      CaseOptionsResponse
  );
}

export async function createCase(
  idToken: string,
  payload: CaseRequest
): Promise<CaseMutationResponse> {
  const response =
    await fetch(
      `${baseUrl}/cases`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${idToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to create case."
      )
    );
  }

  return (
    data as
      CaseMutationResponse
  );
}

export async function updateCase(
  idToken: string,
  caseId: string,
  payload: CaseRequest
): Promise<CaseMutationResponse> {
  const response =
    await fetch(
      `${baseUrl}/cases/${encodeURIComponent(
        caseId
      )}`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${idToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to update case."
      )
    );
  }

  return (
    data as
      CaseMutationResponse
  );
}

export async function updateCaseBudget(
  idToken: string,
  caseId: string,
  payload: CaseBudgetRequest
): Promise<CaseBudgetResponse> {
  const response =
    await fetch(
      `${baseUrl}/cases/${encodeURIComponent(
        caseId
      )}/budget`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${idToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to update case budget."
      )
    );
  }

  return (
    data as
      CaseBudgetResponse
  );
}