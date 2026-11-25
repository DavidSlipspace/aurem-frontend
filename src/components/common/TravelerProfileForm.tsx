import type { FormEvent } from "react";
import type { TravelerProfileRequest } from "../../types/travelerProfile";
import { SeatPreference } from "../../types/seatPreference";
import "../../pages/travelerProfile.css";

type Props = {
  formData: TravelerProfileRequest;
  editingProfileId: string | null;
  isLoading: boolean;
  handleChange: (field: keyof TravelerProfileRequest, value: string) => void;
  handlePhoneChange: (value: string) => void;
  handleCancel: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  addToTrip?: boolean;
};
export function TravelerProfileForm({formData, editingProfileId, isLoading, handleChange, handlePhoneChange, handleCancel, handleSubmit, addToTrip}: Props) {
  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  return (
<form className="traveler-form-card" onSubmit={handleSubmit}>
            <header className="traveler-form-heading">
              <div>
                <h2>{editingProfileId ? "Edit Traveler Profile" : "Create Traveler Profile"}</h2>
                <p>{editingProfileId ? "Update the traveler's personal details and preferences." : "Enter the information below to create a traveler profile."}</p>
              </div>
              <span className="traveler-form-required-note">* Required</span>
            </header>

            <section className="traveler-form-section" aria-labelledby="traveler-personal-heading">
              <div className="traveler-section-heading">
                <span className="traveler-section-number">01</span>
                <div><h3 id="traveler-personal-heading">Personal information</h3><p>Use the traveler's legal name as shown on their identification.</p></div>
              </div>
              <div className="traveler-form-grid">
                <label>Legal first name *
                  <input value={formData.legalFirstName} onChange={(event) => handleChange("legalFirstName", event.target.value)} autoComplete="given-name" maxLength={100} required disabled={isLoading} />
                </label>
                <label>Legal middle name
                  <input value={formData.legalMiddleName ?? ""} onChange={(event) => handleChange("legalMiddleName", event.target.value)} autoComplete="additional-name" maxLength={100} disabled={isLoading} />
                </label>
                <label>Legal last name *
                  <input value={formData.legalLastName} onChange={(event) => handleChange("legalLastName", event.target.value)} autoComplete="family-name" maxLength={100} required disabled={isLoading} />
                </label>
                <label>Date of birth *
                  <input type="date" value={formData.dateOfBirth} onChange={(event) => handleChange("dateOfBirth", event.target.value)} autoComplete="bday" max={new Date().toISOString().substring(0, 10)} required disabled={isLoading} />
                </label>
              </div>
            </section>

            <section className="traveler-form-section" aria-labelledby="traveler-contact-heading">
              <div className="traveler-section-heading">
                <span className="traveler-section-number">02</span>
                <div><h3 id="traveler-contact-heading">Contact information</h3><p>Provide the contact details used for travel coordination.</p></div>
              </div>
              <div className="traveler-form-grid">
                <label>Email address *
                  <input type="email" value={formData.email} onChange={(event) => handleChange("email", event.target.value)} onBlur={() => handleChange("email", normalizeEmail(formData.email))} autoComplete="email" inputMode="email" maxLength={254} placeholder="name@example.com" required disabled={isLoading} />
                </label>
                <label>Phone number *
                  <input type="tel" value={formData.phone} onChange={(event) => handlePhoneChange(event.target.value)} autoComplete="tel-national" inputMode="numeric" maxLength={13} pattern="\(\d{3}\)\d{3}-\d{4}" placeholder="(111)111-1111" title="Enter a 10-digit phone number." required disabled={isLoading} />
                </label>
              </div>
            </section>

            <section className="traveler-form-section" aria-labelledby="traveler-preferences-heading">
              <div className="traveler-section-heading">
                <span className="traveler-section-number">03</span>
                <div><h3 id="traveler-preferences-heading">Travel preferences</h3><p>Record details that can make booking easier.</p></div>
              </div>
              <div className="traveler-form-grid">
                <label>TSA PreCheck number
                  <input value={formData.tsaPrecheckNumber ?? ""} onChange={(event) => handleChange("tsaPrecheckNumber", event.target.value.toUpperCase())} maxLength={25} disabled={isLoading} />
                  <small>Optional known traveler number.</small>
                </label>
                <label>Seat preference
                  <select value={formData.seatPreference ?? ""} onChange={(event) => handleChange("seatPreference", event.target.value)} disabled={isLoading}>
                    <option value="">No preference</option>
                    {Object.values(SeatPreference).map((preference) => <option key={preference} value={preference}>{preference}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="traveler-form-section" aria-labelledby="traveler-loyalty-heading">
              <div className="traveler-section-heading">
                <span className="traveler-section-number">04</span>
                <div><h3 id="traveler-loyalty-heading">Loyalty &amp; rewards</h3><p>Add airline and hotel membership information if available.</p></div>
              </div>
              <div className="traveler-form-grid">
                <label>Frequent flyer program
                  <input value={formData.frequentFlyerProgram ?? ""} onChange={(event) => handleChange("frequentFlyerProgram", event.target.value)} maxLength={100} disabled={isLoading} />
                </label>
                <label>Frequent flyer number
                  <input value={formData.frequentFlyerNumber ?? ""} onChange={(event) => handleChange("frequentFlyerNumber", event.target.value.toUpperCase())} maxLength={50} disabled={isLoading} />
                </label>
                <label>Hotel rewards program
                  <input value={formData.hotelRewardsProgram ?? ""} onChange={(event) => handleChange("hotelRewardsProgram", event.target.value)} maxLength={100} disabled={isLoading} />
                </label>
                <label>Hotel rewards number
                  <input value={formData.hotelRewardsNumber ?? ""} onChange={(event) => handleChange("hotelRewardsNumber", event.target.value.toUpperCase())} maxLength={50} disabled={isLoading} />
                </label>
              </div>
            </section>

            <footer className="traveler-form-actions">
              <button type="button" className="secondary-button" onClick={handleCancel} disabled={isLoading}>Cancel</button>
              <button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : editingProfileId ? "Save changes" : addToTrip ? "Create & add traveler" : "Create traveler"}</button>
            </footer>
          </form>
  );
}
