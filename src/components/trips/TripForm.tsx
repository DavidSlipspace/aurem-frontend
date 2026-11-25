import { AirportAutocomplete } from "./AirportAutocomplete";
import { TravelerMultiSelect } from "../common/TravelerMultiSelect";
import type { FormEvent } from "react";
import type { IpcmDirectoryItem } from "../../types/ipcm";
import type { TravelerProfile } from "../../types/travelerProfile";

export type TripFormState = {
  travelerProfileIds: string[];
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
  companionTraveler: boolean;
  ipcmApprovalRequired: boolean;
  status: string;
};

type TripFormProps = {
  formData: TripFormState;
  isAdmin: boolean;
  travelerProfiles: TravelerProfile[];
  ipcms: IpcmDirectoryItem[];
  isEditing: boolean;
  isSaving: boolean;
  onFieldChange: <Field extends keyof TripFormState>(field: Field, value: TripFormState[Field]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onNewTraveler: () => void;
};

export function TripForm({ formData, isAdmin, travelerProfiles, ipcms, isEditing, isSaving, onFieldChange, onSubmit, onCancel, onNewTraveler }: TripFormProps) {
  const eligibleTravelers = travelerProfiles;
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
          <div><h3 id="trip-traveler-heading">Traveler details</h3><p>Select one or more travelers for this trip.</p></div>
        </div>
        <div className="trip-form-grid">
          <div className="trip-traveler-picker"><button type="button" className="trip-new-traveler-button" onClick={onNewTraveler} disabled={isSaving}>+ New traveler</button>
            <TravelerMultiSelect label="Travelers" required options={eligibleTravelers.map((profile) => ({ id: profile.id, name: [profile.legalFirstName, profile.legalMiddleName, profile.legalLastName].filter(Boolean).join(" "), email: profile.email }))} selectedIds={formData.travelerProfileIds} onChange={(ids) => onFieldChange("travelerProfileIds", ids)} disabled={isSaving} emptyMessage="No active travelers available." /></div>
          <label>Trip purpose *
            <select value={formData.tripPurpose} onChange={(event) => onFieldChange("tripPurpose", event.target.value)} required disabled={isSaving}>
              <option value="">Select a purpose</option>
              {["Monitoring", "Transfer", "Delivery", "Consultation", "Legal", "Other"].map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}
            </select>
          </label>
          {isAdmin ? <label>Assigned Case Manager *<select required value={formData.ipcmUserId} onChange={e=>onFieldChange("ipcmUserId",e.target.value)} disabled={isSaving}><option value="">Select Case Manager</option>{ipcms.map(m=><option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}</select></label> : <div className="trip-assigned-manager">Assigned to you</div>}
          <label>Primary traveler *<select required value={formData.travelerProfileIds[0] || ""} onChange={e=>onFieldChange("travelerProfileIds",[e.target.value,...formData.travelerProfileIds.filter(id=>id!==e.target.value)])}>{formData.travelerProfileIds.map(id=><option key={id} value={id}>{eligibleTravelers.find(p=>p.id===id)?.legalFirstName} {eligibleTravelers.find(p=>p.id===id)?.legalLastName}</option>)}</select></label>
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
          <label>Destination ZIP Code (optional)
            <input inputMode="numeric" autoComplete="postal-code" maxLength={10} placeholder="e.g. 80202" pattern="[0-9]{5}(-[0-9]{4})?" value={formData.clinicZipCode} onChange={(event) => onFieldChange("clinicZipCode", event.target.value)} disabled={isSaving} />
            <small>Optional destination ZIP for hotel searches.</small>
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
        <p className="trip-section-hint">Hotels are searched near the destination ZIP Code when supplied, otherwise near the destination city.</p>
      </section>

      <section className="trip-form-section" aria-labelledby="trip-preferences-heading">
        <div className="trip-section-heading">
          <span className="trip-section-number">04</span>
          <div><h3 id="trip-preferences-heading">Budget & preferences</h3><p>Set spending guidance and approval requirements.</p></div>
        </div>
        <div className="trip-form-grid">
          <label>Shared trip budget<div className="currency-input"><span>$</span><input type="number" min="0" max="21474836.47" step="0.01" value={formData.budgetDollars} onChange={e=>onFieldChange("budgetDollars",e.target.value)} disabled={isSaving}/></div><small>Total budget for all travelers. Required before sending booking link.</small></label>
          <div className="trip-preference-options">
            <label className="trip-checkbox-field"><input type="checkbox" checked={formData.companionTraveler} onChange={(event) => onFieldChange("companionTraveler", event.target.checked)} disabled={isSaving} /><span>Companion traveling</span></label>
            <label className="trip-checkbox-field"><input type="checkbox" checked={formData.ipcmApprovalRequired} onChange={(event) => onFieldChange("ipcmApprovalRequired", event.target.checked)} disabled={isSaving} /><span>Approval needed from the assigned Case Manager</span></label>
          </div>
        </div>
      </section>

      <footer className="trip-form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={isSaving}>Cancel</button>
        <button type="submit" disabled={isSaving || formData.travelerProfileIds.length === 0}>{isSaving ? "Saving..." : isEditing ? "Save changes" : "Create trip"}</button>
      </footer>
    </form>
  );
}
