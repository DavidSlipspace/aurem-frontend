import { AirportAutocomplete } from "./AirportAutocomplete";
import type { FormEvent } from "react";
import type { CaseResponse } from "../../types/case";
import type { IpcmDirectoryItem } from "../../types/ipcm";
import type { Trip } from "../../types/trip";
import type { TravelerProfile } from "../../types/travelerProfile";

export type TripFormState = {
  caseId: string;
  travelerProfileId: string;
  ipcmUserId: string;
  tripPurpose: string;
  outboundDate: string;
  returnDate: string;
  outboundAirport: string;
  returnAirport: string;
  returnDepartureAirport: string;
  returnArrivalAirport: string;
  differentReturnArrival: boolean;
  differentReturnDeparture: boolean;
  destinationCity: string;
  clinicZipCode: string;
  hotelProximityPreference: string;
  minimumHotelStarRating: string;
  budgetDollars: string;
  budgetIsManual: boolean;
  companionTraveler: boolean;
  ipcmApprovalRequired: boolean;
  status: string;
};

type TripFormProps = {
  formData: TripFormState;
  cases: CaseResponse[];
  travelerProfiles: TravelerProfile[];
  ipcms: IpcmDirectoryItem[];
  trips: Trip[];
  editingTripId: string | null;
  isEditing: boolean;
  isSaving: boolean;
  onFieldChange: <Field extends keyof TripFormState>(field: Field, value: TripFormState[Field]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function TripForm({ formData, cases, travelerProfiles, ipcms, trips, editingTripId, isEditing, isSaving, onFieldChange, onSubmit, onCancel }: TripFormProps) {
  const selectedCase = cases.find((item) => item.id === formData.caseId);
  const allowedTravelerIds = new Set(selectedCase?.travelerProfileIds ?? []);
  const eligibleTravelers = travelerProfiles.filter((profile) => allowedTravelerIds.has(profile.id));
  void ipcms;
  const approved = selectedCase?.approvedBudgetCents ?? null;
  const caseTrips = trips.filter((trip) => trip.caseId === formData.caseId);
  const otherTrips = caseTrips.filter((trip) => trip.id !== editingTripId);
  const totalTrips = otherTrips.length + 1;
  const manualOtherTotal = otherTrips.filter((trip) => trip.budgetIsManual).reduce((sum, trip) => sum + trip.budgetFilter, 0);
  const autoOtherCount = otherTrips.filter((trip) => !trip.budgetIsManual).length;
  const available = approved === null ? null : Math.max(0, approved - manualOtherTotal - (formData.budgetIsManual ? Math.round(Number(formData.budgetDollars || 0) * 100) : 0));
  const autoShare = available === null ? null : Math.floor(available / (autoOtherCount + (formData.budgetIsManual ? 0 : 1) || 1));
  const dollars = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <form className="trip-form-card" onSubmit={onSubmit}>
      <header className="trip-form-heading">
        <div>
          <h2>{isEditing ? "Edit Trip" : "Create Trip"}</h2>
          <p>Enter the details below to {isEditing ? "update this trip" : "create a travel request"}.</p>
        </div>
        <span className="trip-form-required-note">* Required</span>
      </header>

      <section className="trip-form-section" aria-labelledby="trip-traveler-heading">
        <div className="trip-section-heading">
          <span className="trip-section-number">01</span>
          <div><h3 id="trip-traveler-heading">Traveler details</h3><p>Assign the trip to a case and traveler.</p></div>
        </div>
        <div className="trip-form-grid">
          <label>Case *
            <select value={formData.caseId} onChange={(event) => onFieldChange("caseId", event.target.value)} required disabled={isSaving}>
              <option value="">Select a case</option>
              {cases.map((item) => <option key={item.id} value={item.id}>{item.caseReferenceId}</option>)}
            </select>
          </label>
          {eligibleTravelers.length > 1 ? (
            <label>Traveler *
              <select value={formData.travelerProfileId} onChange={(event) => onFieldChange("travelerProfileId", event.target.value)} required disabled={isSaving}>
                <option value="">Select a traveler</option>
                {eligibleTravelers.map((profile) => <option key={profile.id} value={profile.id}>{profile.legalFirstName} {profile.legalLastName}</option>)}
              </select>
            </label>
          ) : (
            <div className="trip-assigned-manager"><span className="trip-field-label">Traveler</span>
              <strong>{eligibleTravelers.length === 1 ? `${eligibleTravelers[0].legalFirstName} ${eligibleTravelers[0].legalLastName}` : "Select a case to view"}</strong>
              <span>Automatically selected when the case has one traveler</span>
            </div>
          )}
          <label>Trip purpose *
            <select value={formData.tripPurpose} onChange={(event) => onFieldChange("tripPurpose", event.target.value)} required disabled={isSaving}>
              <option value="">Select a purpose</option>
              {["Monitoring", "Transfer", "Delivery", "Consultation", "Legal", "Other"].map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}
            </select>
          </label>
          <div className="trip-assigned-manager">
            <span className="trip-field-label">Assigned case manager</span>
            <strong>{selectedCase?.caseManagerName || "Select a case to view"}</strong>
            <span>Automatically assigned from the selected case</span>
          </div>
        </div>
      </section>

      <section className="trip-form-section" aria-labelledby="trip-flights-heading">
        <div className="trip-section-heading">
          <span className="trip-section-number">02</span>
          <div><h3 id="trip-flights-heading">Flight details</h3><p>Set the travel dates and airports for both legs.</p></div>
        </div>
        <div className="trip-form-grid">
          <label>Departure date *
            <input type="date" value={formData.outboundDate} onChange={(event) => onFieldChange("outboundDate", event.target.value)} required disabled={isSaving} />
          </label>
          <label>Return date *
            <input type="date" min={formData.outboundDate || undefined} value={formData.returnDate} onChange={(event) => onFieldChange("returnDate", event.target.value)} required disabled={isSaving} />
          </label>
          <div className="trip-airport-group">
            <div className="trip-airport-heading"><strong>Origin</strong><span>Where the traveler starts</span></div>
            <AirportAutocomplete label="Origin airport" value={formData.outboundAirport} onChange={(code) => onFieldChange("outboundAirport", code)} disabled={isSaving} />
            <label className="trip-checkbox-field trip-airport-toggle">
              <input type="checkbox" checked={formData.differentReturnArrival} onChange={(event) => onFieldChange("differentReturnArrival", event.target.checked)} disabled={isSaving} />
              <span>Return to a different airport?</span>
            </label>
            {formData.differentReturnArrival && <div className="trip-airport-override"><AirportAutocomplete label="Arrival airport" value={formData.returnArrivalAirport} onChange={(code) => onFieldChange("returnArrivalAirport", code)} disabled={isSaving} /></div>}
          </div>
          <div className="trip-airport-group">
            <div className="trip-airport-heading"><strong>Destination</strong><span>Where the traveler is going</span></div>
            <AirportAutocomplete label="Destination airport" value={formData.returnAirport} onChange={(code) => onFieldChange("returnAirport", code)} disabled={isSaving} />
            <label className="trip-checkbox-field trip-airport-toggle">
              <input type="checkbox" checked={formData.differentReturnDeparture} onChange={(event) => onFieldChange("differentReturnDeparture", event.target.checked)} disabled={isSaving} />
              <span>Return from a different airport?</span>
            </label>
            {formData.differentReturnDeparture && <div className="trip-airport-override"><AirportAutocomplete label="Departure airport" value={formData.returnDepartureAirport} onChange={(code) => onFieldChange("returnDepartureAirport", code)} disabled={isSaving} /></div>}
          </div>
        </div>
        <p className="trip-section-hint">By default, the return flight departs from the destination airport and arrives at the origin airport.</p>
      </section>

      <section className="trip-form-section" aria-labelledby="trip-destination-heading">
        <div className="trip-section-heading">
          <span className="trip-section-number">03</span>
          <div><h3 id="trip-destination-heading">Destination & stay</h3><p>Provide the destination details and hotel preferences.</p></div>
        </div>
        <div className="trip-form-grid">
          <label>Destination city
            <input type="text" maxLength={100} placeholder="Select a destination airport or enter a city" value={formData.destinationCity} onChange={(event) => onFieldChange("destinationCity", event.target.value)} disabled={isSaving} required />
            <small>Automatically filled when you select a destination airport. You can edit it.</small>
          </label>
          <label>Clinic ZIP code (optional)
            <input inputMode="numeric" autoComplete="postal-code" maxLength={10} placeholder="e.g. 80202" pattern="[0-9]{5}(-[0-9]{4})?" value={formData.clinicZipCode} onChange={(event) => onFieldChange("clinicZipCode", event.target.value)} disabled={isSaving} />
            <small>Approximate hotel search area. Do not enter a clinic street address.</small>
          </label>
          <label>Hotel location preference
            <input placeholder="e.g. Within 5 miles" value={formData.hotelProximityPreference} onChange={(event) => onFieldChange("hotelProximityPreference", event.target.value)} disabled={isSaving} />
          </label>
          <label>Minimum hotel rating
            <select value={formData.minimumHotelStarRating} onChange={(event) => onFieldChange("minimumHotelStarRating", event.target.value)} disabled={isSaving}>
              <option value="">No minimum</option>
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
            </select>
          </label>
        </div>
        <p className="trip-section-hint">Hotels are searched near the clinic ZIP code when supplied, otherwise near the destination city.</p>
      </section>

      <section className="trip-form-section" aria-labelledby="trip-preferences-heading">
        <div className="trip-section-heading">
          <span className="trip-section-number">04</span>
          <div><h3 id="trip-preferences-heading">Budget & preferences</h3><p>Set spending guidance and approval requirements.</p></div>
        </div>
        <div className="trip-form-grid">
          <div className="trip-budget-controls">
            <div className="trip-assigned-manager">
              <span className="trip-field-label">Approved case budget</span>
              <strong>{approved === null ? "Not approved" : dollars(approved)}</strong>
              <span>{totalTrips} trip{totalTrips === 1 ? "" : "s"} including this one</span>
              <span>Suggested case budget: {selectedCase?.suggestedBudgetCents == null ? "Not set" : dollars(selectedCase.suggestedBudgetCents)}</span>
            </div>
            <label className="trip-checkbox-field">
              <input type="checkbox" checked={formData.budgetIsManual} onChange={(event) => { onFieldChange("budgetIsManual", event.target.checked); }} disabled={isSaving} />
              <span>Override automatic trip budget</span>
            </label>
            {formData.budgetIsManual ? (
              <label>Manual trip budget
                <div className="currency-input"><span aria-hidden="true">$</span><input type="number" min="0" step="0.01" required placeholder="0.00" value={formData.budgetDollars} onChange={(event) => onFieldChange("budgetDollars", event.target.value)} disabled={isSaving} /></div>
                <small>Other manual overrides total {dollars(manualOtherTotal)}. Automatic allocations adjust to the remaining budget.</small>
              </label>
            ) : (
              <p className="trip-section-hint">Estimated automatic allocation: <strong>{autoShare === null ? "Awaiting approved case budget" : dollars(autoShare)}</strong>. Final amounts are calculated by the server.</p>
            )}
          </div>
          <div className="trip-preference-options">
            <label className="trip-checkbox-field"><input type="checkbox" checked={formData.companionTraveler} onChange={(event) => onFieldChange("companionTraveler", event.target.checked)} disabled={isSaving} /><span>Companion traveling</span></label>
            <label className="trip-checkbox-field"><input type="checkbox" checked={formData.ipcmApprovalRequired} onChange={(event) => onFieldChange("ipcmApprovalRequired", event.target.checked)} disabled={isSaving} /><span>Approval needed from {selectedCase?.caseManagerName || "assigned case manager"}</span></label>
          </div>
        </div>
      </section>

      <footer className="trip-form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={isSaving}>Cancel</button>
        <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : isEditing ? "Save changes" : "Create trip"}</button>
      </footer>
    </form>
  );
}
