import type {
  IpcmDirectoryItem,
  IpcmDirectoryResponse,
  InviteIpcmResponse,
  RemoveIpcmResponse
} from "../types/ipcm";

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
        message:
          text
      }
    : {};
}

export async function getIpcms(
  idToken: string
): Promise<IpcmDirectoryResponse> {
  const response =
    await fetch(
      `${baseUrl}/ipcms`,
      {
        method:
          "GET",

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
        "Unable to load IPCM profiles."
      )
    );
  }

  return (
    data as
      IpcmDirectoryResponse
  );
}

export async function inviteIpcm(
  idToken: string,
  email: string
): Promise<InviteIpcmResponse> {
  const response =
    await fetch(
      `${baseUrl}/ipcms/invitations`,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${idToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            email
          })
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
        "Unable to send the IPCM invitation."
      )
    );
  }

  return (
    data as
      InviteIpcmResponse
  );
}

export async function removeIpcm(
  idToken: string,
  item: IpcmDirectoryItem
): Promise<RemoveIpcmResponse> {
  const query =
    new URLSearchParams({
      resourceType:
        item.type
    });

  const response =
    await fetch(
      `${baseUrl}/ipcms/${encodeURIComponent(
        item.id
      )}?${query.toString()}`,
      {
        method:
          "DELETE",

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
        "Unable to remove the IPCM."
      )
    );
  }

  return (
    data as
      RemoveIpcmResponse
  );
}