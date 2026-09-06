export type CaseResponse = {
  id: string;

  caseReferenceId: string;

  caseManagerUserId: string;
  caseManagerName: string;

  ipcmUserId: string;
  ipcmName: string;

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

export type CaseOptionsResponse = {
  caseManagers:
    CaseUserOption[];

  ipcms:
    CaseUserOption[];
};

export type CaseRequest = {
  caseReferenceId: string;

  caseManagerUserId:
    string;

  ipcmUserId:
    string;

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