import { useEffect, useRef, useState, type FormEvent } from "react";
import { createTravelerProfile } from "../../api/travelerProfileApi";
import type { TravelerProfile, TravelerProfileRequest } from "../../types/travelerProfile";
import { TravelerProfileForm } from "../common/TravelerProfileForm";
import "./newTripTravelerDialog.css";

type Props = { idToken: string; onCancel: () => void; onCreated: (profile: TravelerProfile) => void };
export function NewTripTravelerDialog({idToken, onCancel, onCreated}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TravelerProfileRequest>({legalFirstName:"", legalLastName:"", dateOfBirth:"", email:"", phone:""});
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => { element?.close(); }; }, []);
  function change(field: keyof TravelerProfileRequest, value: string) { setForm(current => ({...current, [field]:value})); }
  function phone(value: string) {
    const d = value.replace(/\D/g, "").slice(0,10);
    change("phone", !d ? "" : d.length <= 3 ? `(${d}` : d.length <= 6 ? `(${d.slice(0,3)})${d.slice(3)}` : `(${d.slice(0,3)})${d.slice(3,6)}-${d.slice(6)}`);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const payload = {...form, legalFirstName:form.legalFirstName.trim(), legalLastName:form.legalLastName.trim(), legalMiddleName:form.legalMiddleName?.trim(), email:form.email.trim().toLowerCase()};
    if (!payload.legalFirstName || !payload.legalLastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.phone.replace(/\D/g, "").length !== 10) { setError("Enter valid legal names, email and a 10-digit phone number."); return; }
    pending.current = true; setSaving(true); setError("");
    try {
      const result = await createTravelerProfile(idToken, payload);
      onCreated({...payload, id:result.id, status:"active"});
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create traveler."); }
    finally { pending.current = false; setSaving(false); }
  }
  return <dialog ref={dialog} className="trip-new-traveler-dialog" aria-label="Create traveler" onCancel={event => {event.preventDefault(); if (!pending.current) onCancel();}}>
    <p className="trip-new-traveler-note">The traveler will be saved to your directory and added to this trip. Your trip details will stay intact.</p>
    {error && <p role="alert" className="trip-new-traveler-error">{error}</p>}
    <TravelerProfileForm formData={form} editingProfileId={null} isLoading={saving} handleChange={change} handlePhoneChange={phone} handleCancel={onCancel} handleSubmit={submit} addToTrip />
  </dialog>;
}
