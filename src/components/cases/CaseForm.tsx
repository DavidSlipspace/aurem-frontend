import type { FormEvent } from "react";
import type { CaseOptionsResponse } from "../../types/case";
import { TravelerMultiSelect } from "../common/TravelerMultiSelect";

export type CaseFormState = {
  caseReferenceId: string;
  caseManagerUserId: string;
  travelerProfileIds: string[];
  suggestedBudgetDollars: string;
  status: string;
};

type CaseFormProps = {
  formData: CaseFormState;
  options: CaseOptionsResponse;
  isEditing: boolean;
  isSaving: boolean;
  isCaseManager?: boolean;
  onFieldChange: <Field extends keyof CaseFormState>(field: Field, value: CaseFormState[Field]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function CaseForm({ formData, options, isEditing, isSaving, isCaseManager = false, onFieldChange, onSubmit, onCancel }: CaseFormProps) {
  const selectedManager = options.caseManagers.find((manager) => manager.id === formData.caseManagerUserId);
  const managerName = selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}`.trim() : "Assigned to you";
  return (
    <form className="case-form-card" onSubmit={onSubmit}>
      <div className="case-form-heading">
        <div className="case-section-eyebrow">CASE MANAGEMENT</div>
        <h2>{isEditing ? "Edit Case" : "Create Case"}</h2>
        <p>{isCaseManager ? "Manage the travelers associated with your case. Cases you create are assigned to you." : "Assign a Case Manager and the travelers associated with this case. The Case Manager sets the final approved budget."}</p>
      </div>
      <div className="case-form-grid">
        <label>Case Reference *
          <input value={formData.caseReferenceId} onChange={(e) => onFieldChange("caseReferenceId", e.target.value)} maxLength={50} placeholder="CASE-2026-001" required disabled={isSaving} />
        </label>
        <label>Status *
          <select value={formData.status} onChange={(e) => onFieldChange("status", e.target.value)} required disabled={isSaving}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>Case Manager *
          {isCaseManager ? (
            <input value={managerName} readOnly aria-readonly="true" />
          ) : (
            <select value={formData.caseManagerUserId} onChange={(e) => onFieldChange("caseManagerUserId", e.target.value)} required disabled={isSaving}>
              <option value="">Select a case manager</option>
              {options.caseManagers.map((manager) => <option key={manager.id} value={manager.id}>{`${manager.firstName} ${manager.lastName}`.trim()} — {manager.email}</option>)}
            </select>
          )}
          <small>{isCaseManager ? "Your account is automatically assigned to this case." : "Assigned manager for this case."}</small>
        </label>
        <TravelerMultiSelect label="Travelers" required options={options.travelers.map((t) => ({ id: t.id, name: [t.legalFirstName, t.legalMiddleName, t.legalLastName].filter(Boolean).join(" "), email: t.email }))} selectedIds={formData.travelerProfileIds} onChange={(ids) => onFieldChange("travelerProfileIds", ids)} disabled={isSaving} emptyMessage="No traveler profiles available." />
        <label>Suggested Budget
          <div className="case-currency-input"><span>$</span><input type="number" min="0" step="0.01" value={formData.suggestedBudgetDollars} onChange={(e) => onFieldChange("suggestedBudgetDollars", e.target.value)} placeholder="Optional" disabled={isSaving} /></div>
          <small>Optional guidance only. The assigned Case Manager sets the approved budget.</small>
        </label>
      </div>
      <div className="case-form-actions">
        <button type="button" className="case-secondary-button" onClick={onCancel} disabled={isSaving}>Cancel</button>
        <button type="submit" className="case-primary-button" disabled={isSaving || formData.travelerProfileIds.length === 0 || (isCaseManager && !formData.caseManagerUserId)}>{isSaving ? "Saving..." : isEditing ? "Update Case" : "Create Case"}</button>
      </div>
    </form>
  );
}
