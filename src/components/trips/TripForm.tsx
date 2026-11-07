import { AirportAutocomplete } from "./AirportAutocomplete";
import type { FormEvent } from "react";
import type { CaseResponse } from "../../types/case";
import type { IpcmDirectoryItem } from "../../types/ipcm";
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
  destinationAddress: string;
  hotelProximityPreference: string;
  minimumHotelStarRating: string;
  budgetDollars: string;
  companionTraveler: boolean;
  ipcmApprovalRequired: boolean;
  status: string;
};

type TripFormProps = {
  formData: TripFormState;
  cases: CaseResponse[];
  travelerProfiles: TravelerProfile[];
  ipcms: IpcmDirectoryItem[];
  isEditing: boolean;
  isSaving: boolean;
  onFieldChange: <Field extends keyof TripFormState>(field: Field, value: TripFormState[Field]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function TripForm({ formData, cases, travelerProfiles, ipcms, isEditing, isSaving, onFieldChange, onSubmit, onCancel }: TripFormProps) {
  const selectedCase = cases.find((item) => item.id === formData.caseId);
  const allowedTravelerIds = new Set(selectedCase?.travelerProfileIds ?? []);
  const eligibleTravelers = travelerProfiles.filter((profile) => allowedTravelerIds.has(profile.id));
  void ipcms;

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
          <label>Traveler *
            <select value={formData.travelerProfileId} onChange={(event) => onFieldChange("travelerProfileId", event.target.value)} required disabled={isSaving}>
              <option value="">Select a traveler</option>
              {eligibleTravelers.map((profile) => <option key={profile.id} value={profile.id}>{profile.legalFirstName} {profile.legalLastName}</option>)}
            </select>
          </label>
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
              <span>Arriving at a different airport?</span>
            </label>
            {formData.differentReturnArrival && <div className="trip-airport-override"><AirportAutocomplete label="Arrival airport" value={formData.returnArrivalAirport} onChange={(code) => onFieldChange("returnArrivalAirport", code)} disabled={isSaving} /></div>}
          </div>
          <div className="trip-airport-group">
            <div className="trip-airport-heading"><strong>Destination</strong><span>Where the traveler is going</span></div>
            <AirportAutocomplete label="Destination airport" value={formData.returnAirport} onChange={(code) => onFieldChange("returnAirport", code)} disabled={isSaving} />
            <label className="trip-checkbox-field trip-airport-toggle">
              <input type="checkbox" checked={formData.differentReturnDeparture} onChange={(event) => onFieldChange("differentReturnDeparture", event.target.checked)} disabled={isSaving} />
              <span>Departing from a different airport?</span>
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
            <input placeholder="e.g. Denver" value={formData.destinationCity} onChange={(event) => onFieldChange("destinationCity", event.target.value)} disabled={isSaving} />
          </label>
          <label>Destination address
            <input placeholder="Street address (optional)" value={formData.destinationAddress} onChange={(event) => onFieldChange("destinationAddress", event.target.value)} disabled={isSaving} />
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
        <p className="trip-section-hint">Enter a destination city or address to continue.</p>
      </section>

      <section className="trip-form-section" aria-labelledby="trip-preferences-heading">
        <div className="trip-section-heading">
          <span className="trip-section-number">04</span>
          <div><h3 id="trip-preferences-heading">Budget & preferences</h3><p>Set spending guidance and approval requirements.</p></div>
        </div>
        <div className="trip-form-grid">
          <label>Trip budget
            <div className="currency-input"><span aria-hidden="true">$</span><input type="number" min="0" step="0.01" placeholder="0.00" value={formData.budgetDollars} onChange={(event) => onFieldChange("budgetDollars", event.target.value)} disabled={isSaving} /></div>
            <small>Optional until the trip is sent to the traveler.</small>
          </label>
          <div className="trip-preference-options">
            <label className="trip-checkbox-field"><input type="checkbox" checked={formData.companionTraveler} onChange={(event) => onFieldChange("companionTraveler", event.target.checked)} disabled={isSaving} /><span>Companion traveling</span></label>
            <label className="trip-checkbox-field"><input type="checkbox" checked={formData.ipcmApprovalRequired} onChange={(event) => onFieldChange("ipcmApprovalRequired", event.target.checked)} disabled={isSaving} /><span>Require case manager approval before booking</span></label>
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
