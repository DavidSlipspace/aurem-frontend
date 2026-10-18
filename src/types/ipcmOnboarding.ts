export type IpcmInvitationDetails = {
  email: string;

  expiresAt: string;
};

export type AcceptIpcmInvitationRequest = {
  firstName: string;

  lastName: string;

  password: string;
};

export type AcceptIpcmInvitationResponse = {
  message: string;
};