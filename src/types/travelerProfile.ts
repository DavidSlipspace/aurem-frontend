export type TravelerProfile = {
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

export type TravelerProfilesResponse = {
  travelerProfiles: TravelerProfile[];
};

export type TravelerProfileRequest = Omit<
  TravelerProfile,
  "id" | "status"
> & {
  status?: string;
};