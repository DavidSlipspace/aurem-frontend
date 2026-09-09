export type CaseResponse = {
  id: string;

  caseReferenceId: string;

  caseManagerUserId: string;

  caseManagerName: string;

  travelerProfileIds: string[];

  travelerNames: string[];

  suggestedBudgetCents:
    | number
    | null;

  approvedBudgetCents:
    | number
    | null;

  status: string;
};

export type CasesResponse = {
  cases: CaseResponse[];
};

export type CaseUserOption = {
  id: string;

  firstName: string;

  lastName: string;

  email: string;
};

export type CaseTravelerOption = {
  id: string;

  legalFirstName: string;

  legalMiddleName:
    | string
    | null;

  legalLastName: string;

  email: string;
};

export type CaseOptionsResponse = {
  caseManagers:
    CaseUserOption[];

  travelers:
    CaseTravelerOption[];
};

export type CaseRequest = {
  caseReferenceId: string;

  caseManagerUserId:
    string;

  travelerProfileIds:
    string[];

  suggestedBudgetCents:
    | number
    | null;

  status: string;
};

export type CaseMutationResponse = {
  id: string;

  caseReferenceId:
    string;

  message: string;

  emailWarning?:
    string;
};

export type CaseBudgetRequest = {
  approvedBudgetCents:
    number;
};

export type CaseBudgetResponse = {
  id: string;

  approvedBudgetCents:
    number;

  message: string;
};