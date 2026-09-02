import type {
  UserResponse
} from "../types/user";

const baseUrl =
  import.meta.env
    .VITE_API_BASE_URL;

export type UpdateMyProfileRequest = {
  firstName: string;

  lastName: string;
};

export async function updateMyProfile(
  idToken: string,

  payload:
    UpdateMyProfileRequest
): Promise<UserResponse> {
  const response =
    await fetch(
      `${baseUrl}/me/profile`,
      {
        method:
          "PUT",

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
    await response.json();

  if (
    !response.ok
  ) {
    throw new Error(
      data.message ??
        "Unable to update profile."
    );
  }

  return data as
    UserResponse;
}