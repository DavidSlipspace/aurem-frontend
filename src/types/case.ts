export type CaseResponse = {
  id: string;
  caseReferenceId: string;
  companyName: string;
  gpName: string;
  ipName: string;
  budget: number;
  status: string;
};

export type CasesResponse = {
  cases: CaseResponse[];
};