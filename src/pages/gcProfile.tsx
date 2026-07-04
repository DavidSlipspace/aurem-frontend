import { FormEvent, useEffect, useState } from "react";
import {
  createGcProfile,
  getGcProfiles,
  updateGcProfile
} from "../api/gcProfileApi";
import type { GcProfile, GcProfileRequest } from "../types/gcProfile";
import "./gcProfile.css";

type GcProfilesPageProps = {
  idToken: string;
};

const emptyForm: GcProfileRequest = {
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

export function GcProfilesPage({ idToken }: GcProfilesPageProps) {
  const [profiles, setProfiles] = useState<GcProfile[]>([]);
  const [formData, setFormData] = useState<GcProfileRequest>(emptyForm);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setErrorMessage("");
      const response = await getGcProfiles(idToken);
      setProfiles(response.gcProfiles);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load GC profiles."
      );
    }
  }

  function handleChange(field: keyof GcProfileRequest, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleNewProfile() {
    setFormData(emptyForm);
    setEditingProfileId(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleEdit(profile: GcProfile) {
    setFormData({
      legalFirstName: profile.legalFirstName,
      legalMiddleName: profile.legalMiddleName ?? "",
      legalLastName: profile.legalLastName,
      dateOfBirth: profile.dateOfBirth?.substring(0, 10),
      email: profile.email,
      phone: profile.phone,
      tsaPrecheckNumber: profile.tsaPrecheckNumber ?? "",
      frequentFlyerProgram: profile.frequentFlyerProgram ?? "",
      frequentFlyerNumber: profile.frequentFlyerNumber ?? "",
      hotelRewardsProgram: profile.hotelRewardsProgram ?? "",
      hotelRewardsNumber: profile.hotelRewardsNumber ?? "",
      seatPreference: profile.seatPreference ?? "",
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

  async function handleDeactivate(profile: GcProfile) {
  const confirmed = window.confirm(
    `Deactivate ${profile.legalFirstName} ${profile.legalLastName}?`
  );

  if (!confirmed) return;

  setIsLoading(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    await updateGcProfile(idToken, profile.id, {
      legalFirstName: profile.legalFirstName,
      legalMiddleName: profile.legalMiddleName ?? "",
      legalLastName: profile.legalLastName,
      dateOfBirth: profile.dateOfBirth?.substring(0, 10),
      email: profile.email,
      phone: profile.phone,
      tsaPrecheckNumber: profile.tsaPrecheckNumber ?? "",
      frequentFlyerProgram: profile.frequentFlyerProgram ?? "",
      frequentFlyerNumber: profile.frequentFlyerNumber ?? "",
      hotelRewardsProgram: profile.hotelRewardsProgram ?? "",
      hotelRewardsNumber: profile.hotelRewardsNumber ?? "",
      seatPreference: profile.seatPreference ?? "",
      status: "inactive"
    });

    setSuccessMessage("GC profile deactivated.");
    await loadProfiles();
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : "Unable to deactivate GC profile."
    );
  } finally {
    setIsLoading(false);
  }
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingProfileId) {
        await updateGcProfile(idToken, editingProfileId, formData);
        setSuccessMessage("GC profile updated.");
      } else {
        await createGcProfile(idToken, formData);
        setSuccessMessage("GC profile created.");
      }

      await loadProfiles();
      handleCancel();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save GC profile."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="gc-page">
      <section className="gc-content">
        <div className="gc-header">
          <div>
            <h1>GC Profiles</h1>
            <p>Create and manage travel profiles.</p>
          </div>

          <button onClick={handleNewProfile}>+ New GC Profile</button>
        </div>

        {successMessage && <p className="gc-success">{successMessage}</p>}
        {errorMessage && <p className="gc-error">{errorMessage}</p>}

        {showForm && (
          <form className="gc-form-card" onSubmit={handleSubmit}>
            <h2>{editingProfileId ? "Edit GC Profile" : "New GC Profile"}</h2>

            <div className="gc-form-grid">
              <label>
                Legal First Name *
                <input
                  value={formData.legalFirstName}
                  onChange={(e) => handleChange("legalFirstName", e.target.value)}
                  required
                />
              </label>

              <label>
                Legal Middle Name
                <input
                  value={formData.legalMiddleName ?? ""}
                  onChange={(e) => handleChange("legalMiddleName", e.target.value)}
                />
              </label>

              <label>
                Legal Last Name *
                <input
                  value={formData.legalLastName}
                  onChange={(e) => handleChange("legalLastName", e.target.value)}
                  required
                />
              </label>

              <label>
                Date of Birth *
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  required
                />
              </label>

              <label>
                Email *
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </label>

              <label>
                Phone *
                <input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </label>

              <label>
                TSA PreCheck Number
                <input
                  value={formData.tsaPrecheckNumber ?? ""}
                  onChange={(e) =>
                    handleChange("tsaPrecheckNumber", e.target.value)
                  }
                />
              </label>

              <label>
                Seat Preference
                <input
                  value={formData.seatPreference ?? ""}
                  onChange={(e) => handleChange("seatPreference", e.target.value)}
                />
              </label>

              <label>
                Frequent Flyer Program
                <input
                  value={formData.frequentFlyerProgram ?? ""}
                  onChange={(e) =>
                    handleChange("frequentFlyerProgram", e.target.value)
                  }
                />
              </label>

              <label>
                Frequent Flyer Number
                <input
                  value={formData.frequentFlyerNumber ?? ""}
                  onChange={(e) =>
                    handleChange("frequentFlyerNumber", e.target.value)
                  }
                />
              </label>

              <label>
                Hotel Rewards Program
                <input
                  value={formData.hotelRewardsProgram ?? ""}
                  onChange={(e) =>
                    handleChange("hotelRewardsProgram", e.target.value)
                  }
                />
              </label>

              <label>
                Hotel Rewards Number
                <input
                  value={formData.hotelRewardsNumber ?? ""}
                  onChange={(e) =>
                    handleChange("hotelRewardsNumber", e.target.value)
                  }
                />
              </label>
            </div>

            <div className="gc-form-actions">
              <button type="button" className="secondary-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : editingProfileId
                    ? "Update Profile"
                    : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        <div className="gc-table-card">
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
                      {profile.legalFirstName} {profile.legalLastName}
                    </td>
                    <td>{profile.dateOfBirth?.substring(0, 10)}</td>
                    <td>{profile.email}</td>
                    <td>{profile.phone}</td>
                    <td>{profile.tsaPrecheckNumber || "-"}</td>
                    <td>{profile.seatPreference || "-"}</td>
                    <td>
                      <span className="gc-status">{profile.status}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-action-button"
                          onClick={() => handleEdit(profile)}
                        >
                          Edit
                        </button>

                        {profile.status === "active" && (
                          <button
                            className="table-action-button danger"
                            onClick={() => handleDeactivate(profile)}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-state" colSpan={8}>
                    No GC profiles found.
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