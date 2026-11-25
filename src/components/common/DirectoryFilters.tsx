import type { Trip } from "../../types/trip";
import type { TravelerProfile } from "../../types/travelerProfile";
import "./directoryFilters.css";

export const emptyTripFilters = { search: "", status: "", manager: "", approver: "", approval: "", from: "", to: "" };
export const emptyTravelerFilters = { search: "", status: "" };
type TripFilterState = typeof emptyTripFilters;
type TravelerFilterState = typeof emptyTravelerFilters;
type Option = { value: string; label: string };
const normalize = (v: string) => v.toLowerCase().trim();
function matches(query: string, fields: (string | null | undefined)[]) {
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return normalize(query).split(/\s+/).every(term => haystack.includes(term));
}
export function filterTrips(trips: Trip[], f: TripFilterState) {
  return trips.filter(t => matches(f.search, [t.tripReferenceId, t.travelerName, t.travelerEmail, ...(t.travelerNames ?? []), t.destinationCity, t.outboundAirport, t.returnAirport, t.returnDepartureAirport, t.returnArrivalAirport, t.tripPurpose, t.ipcmName, t.approvingCaseManagerName]) &&
    (!f.status || t.status === f.status) && (!f.manager || t.ipcmUserId === f.manager) && (!f.approver || t.approvingCaseManagerUserId === f.approver) &&
    (!f.approval || t.ipcmApprovalRequired === (f.approval === "yes")) && (!f.from || t.outboundDate.slice(0,10) >= f.from) && (!f.to || t.outboundDate.slice(0,10) <= f.to));
}
export function filterTravelers(profiles: TravelerProfile[], f: TravelerFilterState) {
  return profiles.filter(p => {
    const digits = f.search.replace(/\D/g, "");
    const phoneMatch = digits.length > 0 && /^[\d\s()+.-]+$/.test(f.search.trim()) && (p.phone ?? "").replace(/\D/g, "").includes(digits);
    return (!f.status || p.status === f.status) && (phoneMatch || matches(f.search, [p.legalFirstName, p.legalMiddleName, p.legalLastName, p.email, p.phone]));
  });
}
function options(values: (string | null | undefined)[]): Option[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort().map(v => ({value:v,label:v}));
}
function people(values: {value: string | null; label: string | null}[]): Option[] {
  const map = new Map<string,string>();
  values.forEach(v => { if(v.value) map.set(v.value,v.label || v.value); });
  return Array.from(map, ([value,label]) => ({value,label})).sort((a,b)=>a.label.localeCompare(b.label));
}
function SelectField({label,value,onChange,items,all}: {label:string;value:string;onChange:(v:string)=>void;items:Option[];all:string}) {
  return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}><option value="">{all}</option>{items.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}{value && !items.some(o=>o.value===value) && <option value={value}>Previously selected</option>}</select></label>;
}
function SearchField({value,onChange,placeholder}: {value:string;onChange:(v:string)=>void;placeholder:string}) {
  return <label className="directory-search">Search<div className="directory-search-input"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input type="search" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div></label>;
}
function Footer({count,total,noun,clear,active}: {count:number;total:number;noun:string;clear:()=>void;active:boolean}) {
  return <div className="directory-filter-footer"><span role="status">Showing {count} of {total} {noun}</span><button type="button" disabled={!active} onClick={clear}>Clear filters</button></div>;
}
export function TripFilters({trips,value,onChange,count}: {trips:Trip[];value:TripFilterState;onChange:(v:TripFilterState)=>void;count:number}) {
  const set = (key:keyof TripFilterState,v:string) => onChange({...value,[key]:v});
  return <section className="directory-filters" aria-label="Trip filters"><div className="directory-filter-grid">
    <SearchField value={value.search} onChange={v=>set("search",v)} placeholder="Trip ID, traveler, destination, airport..."/>
    <SelectField label="Status" value={value.status} onChange={v=>set("status",v)} items={options(trips.map(t=>t.status))} all="All statuses"/>
    <SelectField label="Assigned Case Manager" value={value.manager} onChange={v=>set("manager",v)} items={people(trips.map(t=>({value:t.ipcmUserId,label:t.ipcmName})))} all="All Case Managers"/>
    <SelectField label="Approving Case Manager" value={value.approver} onChange={v=>set("approver",v)} items={people(trips.map(t=>({value:t.approvingCaseManagerUserId,label:t.approvingCaseManagerName})))} all="All approvers"/>
    <SelectField label="Approval required" value={value.approval} onChange={v=>set("approval",v)} items={[{value:"yes",label:"Required"},{value:"no",label:"Not required"}]} all="Any"/>
    <label>Departure from<input type="date" value={value.from} max={value.to || undefined} onChange={e=>set("from",e.target.value)}/></label>
    <label>Departure through<input type="date" value={value.to} min={value.from || undefined} onChange={e=>set("to",e.target.value)}/></label>
  </div>{value.from && value.to && value.from > value.to && <p role="alert">Departure start must be on or before the end date.</p>}<Footer count={count} total={trips.length} noun="trips" active={Object.values(value).some(Boolean)} clear={()=>onChange({...emptyTripFilters})}/></section>;
}
export function TravelerFilters({profiles,value,onChange,count}: {profiles:TravelerProfile[];value:TravelerFilterState;onChange:(v:TravelerFilterState)=>void;count:number}) {
  return <section className="directory-filters" aria-label="Traveler filters"><div className="directory-filter-grid"><SearchField value={value.search} onChange={search=>onChange({...value,search})} placeholder="Name, email or phone..."/><SelectField label="Status" value={value.status} onChange={status=>onChange({...value,status})} items={options(profiles.map(p=>p.status))} all="All statuses"/></div><Footer count={count} total={profiles.length} noun="travelers" active={Object.values(value).some(Boolean)} clear={()=>onChange({...emptyTravelerFilters})}/></section>;
}
