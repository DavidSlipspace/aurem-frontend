import "./PasswordRequirements.css";

const rules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter (A–Z)", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter (a–z)", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one number (0–9)", test: (value: string) => /[0-9]/.test(value) },
  { label: "At least one special character (e.g. !, @, #)", test: (value: string) => /[!-/:-@\[-`{-~]/.test(value) },
];

export function meetsPasswordRequirements(password: string): boolean {
  return rules.every(rule => rule.test(password));
}

export function PasswordRequirements({ password, confirmation }: { password: string; confirmation: string }) {
  const matches = password.length > 0 && password === confirmation;
  return (
    <div className="orvo-password-requirements" id="password-requirements">
      <strong>Password requirements</strong>
      <ul>
        {rules.map(rule => {
          const met = rule.test(password);
          return <li key={rule.label} className={met ? "is-met" : ""}><span aria-hidden="true">{met ? "✓" : "○"}</span><span>{rule.label}<span className="orvo-password-sr"> — {met ? "met" : "not met"}</span></span></li>;
        })}
        <li className={matches ? "is-met" : ""}><span aria-hidden="true">{matches ? "✓" : "○"}</span><span>Passwords match<span className="orvo-password-sr"> — {matches ? "met" : "not met"}</span></span></li>
      </ul>
      <span className="orvo-password-sr" role="status">{rules.filter(rule => rule.test(password)).length} of 5 password requirements met. {matches ? "Passwords match." : "Passwords do not match yet."}</span>
    </div>
  );
}
