import type {
  AcceptIpcmInvitationRequest,
  AcceptIpcmInvitationResponse,
  IpcmInvitationDetails
} from "../types/ipcmOnboarding";

const baseUrl =
  import.meta.env
    .VITE_API_BASE_URL;

async function parseJson(
  response: Response
): Promise<unknown> {
  const data =
    await response.json();

  if (
    !response.ok
  ) {
    const message =
      typeof data ===
        "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message ===
        "string"
        ? data.message
        : "Unable to complete IPCM onboarding.";

    throw new Error(
      message
    );
  }

  return data;
}

export async function getIpcmInvitation(
  token: string
): Promise<IpcmInvitationDetails> {
  const response =
    await fetch(
      `${baseUrl}/public/ipcm-invitations/${encodeURIComponent(
        token
      )}`,
      {
        method:
          "GET"
      }
    );

  return (
    await parseJson(
      response
    )
  ) as
    IpcmInvitationDetails;
}

export async function acceptIpcmInvitation(
  token: string,

  payload:
    AcceptIpcmInvitationRequest
): Promise<AcceptIpcmInvitationResponse> {
  const response =
    await fetch(
      `${baseUrl}/public/ipcm-invitations/${encodeURIComponent(
        token
      )}/accept`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  return (
    await parseJson(
      response
    )
  ) as
    AcceptIpcmInvitationResponse;
}