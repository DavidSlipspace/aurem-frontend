export type GcProfile = {
  id: string;
  legalFirstName: string;
  legalMiddleName?: string | null;
  legalLastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  tsaPrecheckNumber?: string | null;
  frequentFlyerProgram?: string | null;
  frequentFlyerNumber?: string | null;
  hotelRewardsProgram?: string | null;
  hotelRewardsNumber?: string | null;
  seatPreference?: string | null;
  status: string;
};

export type GcProfilesResponse = {
  gcProfiles: GcProfile[];
};

export type GcProfileRequest = Omit<GcProfile, "id" | "status"> & {
  status?: string;
};