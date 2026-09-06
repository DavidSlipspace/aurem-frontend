import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  createCase,
  getCaseOptions,
  getCases,
  updateCase,
  updateCaseBudget
} from "../api/caseApi";

import {
  CaseBudgetForm
} from "../components/cases/CaseBudgetForm";

import {
  CaseForm,
  type CaseFormState
} from "../components/cases/CaseForm";

import {
  CasesTable
} from "../components/cases/CasesTable";

import type {
  CaseOptionsResponse,
  CaseRequest,
  CaseResponse
} from "../types/case";

import type {
  UserResponse
} from "../types/user";

import "./home.css";

type HomePageProps = {
  idToken:
    string;

  cases:
    CaseResponse[];

  user:
    UserResponse;

  onCasesChanged: (
    cases:
      CaseResponse[]
  ) => void;
};

const EMPTY_OPTIONS:
  CaseOptionsResponse = {
    caseManagers: [],
    ipcms: []
  };

const EMPTY_FORM:
  CaseFormState = {
    caseReferenceId: "",
    caseManagerUserId: "",
    ipcmUserId: "",
    suggestedBudgetDollars:
      "",
    status: "active"
  };

function centsToDollars(
  cents:
    | number
    | null
): string {
  if (
    cents === null
  ) {
    return "";
  }

  return (
    cents / 100
  ).toFixed(
    2
  );
}

function dollarsToCents(
  value: string
):
  | number
  | null {
  const normalized =
    value.trim();

  if (!normalized) {
    return null;
  }

  const dollars =
    Number(
      normalized
    );

  if (
    !Number.isFinite(
      dollars
    ) ||
    dollars < 0
  ) {
    throw new Error(
      "Suggested budget must be a valid non-negative amount."
    );
  }

  return Math.round(
    dollars *
      100
  );
}

export function HomePage({
  idToken,
  cases,
  user,
  onCasesChanged
}: HomePageProps) {
  const isAdmin =
    user.role ===
    "Admin";

  const isIpcm =
    user.role ===
    "IPCM";

  const [
    options,
    setOptions
  ] =
    useState<
      CaseOptionsResponse
    >(
      EMPTY_OPTIONS
    );

  const [
    formData,
    setFormData
  ] =
    useState<
      CaseFormState
    >(
      EMPTY_FORM
    );

  const [
    editingCase,
    setEditingCase
  ] =
    useState<
      CaseResponse |
      null
    >(
      null
    );

  const [
    budgetingCase,
    setBudgetingCase
  ] =
    useState<
      CaseResponse |
      null
    >(
      null
    );

  const [
    showCaseForm,
    setShowCaseForm
  ] =
    useState(
      false
    );

  const [
    isSaving,
    setIsSaving
  ] =
    useState(
      false
    );

  const [
    isLoadingOptions,
    setIsLoadingOptions
  ] =
    useState(
      false
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState(
      ""
    );

  const [
    successMessage,
    setSuccessMessage
  ] =
    useState(
      ""
    );

  const refreshCases =
    useCallback(
      async () => {
        const response =
          await getCases(
            idToken
          );

        onCasesChanged(
          response.cases
        );
      },
      [
        idToken,
        onCasesChanged
      ]
    );

  const loadOptions =
    useCallback(
      async () => {
        if (!isAdmin) {
          return;
        }

        setIsLoadingOptions(
          true
        );

        try {
          const response =
            await getCaseOptions(
              idToken
            );

          setOptions(
            response
          );
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load case assignment options."
          );
        } finally {
          setIsLoadingOptions(
            false
          );
        }
      },
      [
        idToken,
        isAdmin
      ]
    );

  useEffect(
    () => {
      if (
        isAdmin
      ) {
        void loadOptions();
      }
    },
    [
      isAdmin,
      loadOptions
    ]
  );

  function resetCaseForm() {
    setFormData(
      EMPTY_FORM
    );

    setEditingCase(
      null
    );

    setShowCaseForm(
      false
    );
  }

  function handleCreateCase() {
    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    setEditingCase(
      null
    );

    setFormData(
      EMPTY_FORM
    );

    setShowCaseForm(
      true
    );
  }

  function handleEditCase(
    caseItem:
      CaseResponse
  ) {
    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    setBudgetingCase(
      null
    );

    setEditingCase(
      caseItem
    );

    setFormData({
      caseReferenceId:
        caseItem
          .caseReferenceId,

      caseManagerUserId:
        caseItem
          .caseManagerUserId,

      ipcmUserId:
        caseItem
          .ipcmUserId,

      suggestedBudgetDollars:
        centsToDollars(
          caseItem
            .suggestedBudgetCents
        ),

      status:
        caseItem.status
    });

    setShowCaseForm(
      true
    );
  }

  function handleSetBudget(
    caseItem:
      CaseResponse
  ) {
    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    setShowCaseForm(
      false
    );

    setBudgetingCase(
      caseItem
    );
  }

  function handleFieldChange<
    Field extends
      keyof CaseFormState
  >(
    field: Field,
    value:
      CaseFormState[Field]
  ) {
    setFormData(
      (
        current
      ) => ({
        ...current,
        [field]:
          value
      })
    );
  }

  async function handleCaseSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isAdmin) {
      return;
    }

    setIsSaving(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const payload:
        CaseRequest = {
          caseReferenceId:
            formData
              .caseReferenceId
              .trim(),

          caseManagerUserId:
            formData
              .caseManagerUserId,

          ipcmUserId:
            formData
              .ipcmUserId,

          suggestedBudgetCents:
            dollarsToCents(
              formData
                .suggestedBudgetDollars
            ),

          status:
            formData.status
        };

      const response =
        editingCase
          ? await updateCase(
              idToken,
              editingCase.id,
              payload
            )
          : await createCase(
              idToken,
              payload
            );

      const message =
        response
          .emailWarning
          ? `${response.message} ${response.emailWarning}`
          : response.message;

      setSuccessMessage(
        message
      );

      resetCaseForm();

      await refreshCases();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save case."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  async function handleBudgetSave(
    approvedBudgetCents:
      number
  ) {
    if (
      !budgetingCase ||
      !isIpcm
    ) {
      return;
    }

    setIsSaving(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const response =
        await updateCaseBudget(
          idToken,
          budgetingCase.id,
          {
            approvedBudgetCents
          }
        );

      setSuccessMessage(
        response.message
      );

      setBudgetingCase(
        null
      );

      await refreshCases();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the case budget."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  return (
    <main className="home-page">
      <section className="home-content">
        <header className="home-header">
          <div>
            <h1>
              {isIpcm
                ? "My Cases"
                : "Active Cases"}
            </h1>

            <p>
              {isIpcm
                ? "Cases currently assigned to you."
                : "Cases currently available based on your role and assignments."}
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="case-primary-button"
              onClick={
                handleCreateCase
              }
              disabled={
                isLoadingOptions
              }
            >
              + Create Case
            </button>
          )}
        </header>

        {errorMessage && (
          <div
            className="case-error-message"
            role="alert"
          >
            {
              errorMessage
            }
          </div>
        )}

        {successMessage && (
          <div
            className="case-success-message"
            role="status"
          >
            {
              successMessage
            }
          </div>
        )}

        {isAdmin &&
          showCaseForm && (
            <CaseForm
              formData={
                formData
              }
              options={
                options
              }
              isEditing={
                editingCase !==
                null
              }
              isSaving={
                isSaving
              }
              onFieldChange={
                handleFieldChange
              }
              onSubmit={
                handleCaseSubmit
              }
              onCancel={
                resetCaseForm
              }
            />
          )}

        {isIpcm &&
          budgetingCase && (
            <CaseBudgetForm
              caseItem={
                budgetingCase
              }
              isSaving={
                isSaving
              }
              onSave={
                handleBudgetSave
              }
              onCancel={() =>
                setBudgetingCase(
                  null
                )
              }
            />
          )}

        <CasesTable
          cases={
            cases
          }
          user={
            user
          }
          onEdit={
            handleEditCase
          }
          onSetBudget={
            handleSetBudget
          }
        />
      </section>
    </main>
  );
}