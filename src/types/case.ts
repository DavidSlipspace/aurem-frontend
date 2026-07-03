export type CaseResponse = {
  id: string;
  caseReferenceId: string;
  caseManagerName: string;
  ipcmName: string;
  status: string;
};

export type CasesResponse = {
  cases: CaseResponse[];
};