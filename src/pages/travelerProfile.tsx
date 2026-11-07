import {
  useEffect,
  useState,
  type FormEvent
} from "react";
import {
  createTravelerProfile,
  getTravelerProfiles,
  updateTravelerProfile
} from "../api/travelerProfileApi";
import type {
  TravelerProfile,
  TravelerProfileRequest
} from "../types/travelerProfile";
import { SeatPreference } from "../types/seatPreference";
import "./travelerProfile.css";
type TravelerProfilesPageProps = {
  idToken: string;
};
type TravelerProfileFormState = Omit<
  TravelerProfileRequest,
  "seatPreference"
> & {
  seatPreference: SeatPreference | "";
};
const emptyForm: TravelerProfileFormState = {
  legalFirstName: "",
  legalMiddleName: "",
  legalLastName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  tsaPrecheckNumber: "",
  frequentFlyerProgram: "",
  frequentFlyerNumber: "",
  hotelRewardsProgram: "",
  hotelRewardsNumber: "",
  seatPreference: ""
};
export function TravelerProfilesPage({
  idToken
}: TravelerProfilesPageProps) {
  const [profiles, setProfiles] =
    useState<TravelerProfile[]>([]);
  const [formData, setFormData] =
    useState<TravelerProfileFormState>(emptyForm);
  const [editingProfileId, setEditingProfileId] =
    useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    loadProfiles();
  }, [idToken]);
  async function loadProfiles() {
    try {
      setErrorMessage("");
      const response = await getTravelerProfiles(idToken);
      setProfiles(response.travelerProfiles);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load Traveler profiles."
      );
    }
  }
  function handleChange(
    field: keyof TravelerProfileFormState,
    value: string
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }
  function getPhoneDigits(value: string) {
    return value.replace(/\D/g, "").slice(0, 10);
  }
  function formatPhoneNumber(value: string) {
    const digits = getPhoneDigits(value);
    if (digits.length === 0) {
      return "";
    }
    if (digits.length <= 3) {
      return `(${digits}`;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)})${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)})${digits.slice(
      3,
      6
    )}-${digits.slice(6, 10)}`;
  }
  function handlePhoneChange(value: string) {
    handleChange("phone", formatPhoneNumber(value));
  }
  function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }
  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  function handleNewProfile() {
    setFormData(emptyForm);
    setEditingProfileId(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }
  function handleEdit(profile: TravelerProfile) {
    setFormData({
      legalFirstName: profile.legalFirstName,
      legalMiddleName:
        profile.legalMiddleName ?? "",
      legalLastName: profile.legalLastName,
      dateOfBirth:
        profile.dateOfBirth?.substring(0, 10) ?? "",
      email: profile.email,
      phone: formatPhoneNumber(profile.phone),
      tsaPrecheckNumber:
        profile.tsaPrecheckNumber ?? "",
      frequentFlyerProgram:
        profile.frequentFlyerProgram ?? "",
      frequentFlyerNumber:
        profile.frequentFlyerNumber ?? "",
      hotelRewardsProgram:
        profile.hotelRewardsProgram ?? "",
      hotelRewardsNumber:
        profile.hotelRewardsNumber ?? "",
      seatPreference:
        (profile.seatPreference as SeatPreference) ?? "",
      status: profile.status
    });
    setEditingProfileId(profile.id);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }
  function handleCancel() {
    setFormData(emptyForm);
    setEditingProfileId(null);
    setShowForm(false);
  }
  function buildRequestPayload(
    status?: string
  ): TravelerProfileRequest {
    const normalizedEmail = normalizeEmail(
      formData.email
    );
    const phoneDigits = getPhoneDigits(formData.phone);
    if (!isValidEmail(normalizedEmail)) {
      throw new Error(
        "Enter a valid email address."
      );
    }
    if (phoneDigits.length !== 10) {
      throw new Error(
        "Phone number must contain exactly 10 digits."
      );
    }
    return {
      legalFirstName:
        formData.legalFirstName.trim(),
      legalMiddleName:
        formData.legalMiddleName?.trim() ?? "",
      legalLastName:
        formData.legalLastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      email: normalizedEmail,
      phone: formatPhoneNumber(phoneDigits),
      tsaPrecheckNumber:
        formData.tsaPrecheckNumber
          ?.trim()
          .toUpperCase() ?? "",
      frequentFlyerProgram:
        formData.frequentFlyerProgram?.trim() ?? "",
      frequentFlyerNumber:
        formData.frequentFlyerNumber
          ?.trim()
          .toUpperCase() ?? "",
      hotelRewardsProgram:
        formData.hotelRewardsProgram?.trim() ?? "",
      hotelRewardsNumber:
        formData.hotelRewardsNumber
          ?.trim()
          .toUpperCase() ?? "",
      seatPreference:
        formData.seatPreference || "",
      status: status ?? formData.status
    };
  }
  async function handleStatusChange(
    profile: TravelerProfile,
    newStatus: "active" | "inactive"
  ) {
    const action =
      newStatus === "active"
        ? "activate"
        : "deactivate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ` +
        `${profile.legalFirstName} ` +
        `${profile.legalLastName}?`
    );
    if (!confirmed) {
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const payload: TravelerProfileRequest = {
        legalFirstName:
          profile.legalFirstName.trim(),
        legalMiddleName:
          profile.legalMiddleName?.trim() ?? "",
        legalLastName:
          profile.legalLastName.trim(),
        dateOfBirth:
          profile.dateOfBirth.substring(0, 10),
        email: normalizeEmail(profile.email),
        phone: formatPhoneNumber(profile.phone),
        tsaPrecheckNumber:
          profile.tsaPrecheckNumber
            ?.trim()
            .toUpperCase() ?? "",
        frequentFlyerProgram:
          profile.frequentFlyerProgram?.trim() ?? "",
        frequentFlyerNumber:
          profile.frequentFlyerNumber
            ?.trim()
            .toUpperCase() ?? "",
        hotelRewardsProgram:
          profile.hotelRewardsProgram?.trim() ?? "",
        hotelRewardsNumber:
          profile.hotelRewardsNumber
            ?.trim()
            .toUpperCase() ?? "",
        seatPreference:
          profile.seatPreference ?? "",
        status: newStatus
      };
      await updateTravelerProfile(
        idToken,
        profile.id,
        payload
      );
      setSuccessMessage(
        `Traveler profile ${
          newStatus === "active"
            ? "activated"
            : "deactivated"
        }.`
      );
      await loadProfiles();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Unable to ${action} Traveler profile.`
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const payload = buildRequestPayload();
      if (editingProfileId) {
        await updateTravelerProfile(
          idToken,
          editingProfileId,
          payload
        );
        setSuccessMessage(
          "Traveler profile updated."
        );
      } else {
        await createTravelerProfile(
          idToken,
          payload
        );
        setSuccessMessage(
          "Traveler profile created."
        );
      }
      await loadProfiles();
      setFormData(emptyForm);
      setEditingProfileId(null);
      setShowForm(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save Traveler profile."
      );
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <main className="traveler-page">
      <section className="traveler-content">
        <div className="traveler-header">
          <div>
            <h1>Traveler Profiles</h1>
            <p>
              Create and manage travel profiles.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewProfile}
            disabled={isLoading}
          >
            + New Traveler Profile
          </button>
        </div>
        {successMessage && (
          <p className="traveler-success">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="traveler-error">
            {errorMessage}
          </p>
        )}
        {showForm && (
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
              <button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : editingProfileId ? "Save changes" : "Create traveler"}</button>
            </footer>
          </form>
        )}
        <div className="traveler-table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>DOB</th>
                <th>Email</th>
                <th>Phone</th>
                <th>TSA</th>
                <th>Seat</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length > 0 ? (
                profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      {profile.legalFirstName}{" "}
                      {profile.legalLastName}
                    </td>
                    <td>
                      {profile.dateOfBirth?.substring(
                        0,
                        10
                      )}
                    </td>
                    <td>{profile.email}</td>
                    <td>
                      {formatPhoneNumber(profile.phone)}
                    </td>
                    <td>
                      {profile.tsaPrecheckNumber || "-"}
                    </td>
                    <td>
                      {profile.seatPreference || "No Preference"}
                    </td>
                    <td>
                      <span
                        className={`traveler-status ${
                          profile.status === "active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {profile.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action-button"
                          onClick={() =>
                            handleEdit(profile)
                          }
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        {profile.status === "active" ? (
                          <button
                            type="button"
                            className={
                              "table-action-button danger"
                            }
                            onClick={() =>
                              handleStatusChange(
                                profile,
                                "inactive"
                              )
                            }
                            disabled={isLoading}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={
                              "table-action-button success"
                            }
                            onClick={() =>
                              handleStatusChange(
                                profile,
                                "active"
                              )
                            }
                            disabled={isLoading}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="empty-state"
                    colSpan={8}
                  >
                    No Traveler profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
