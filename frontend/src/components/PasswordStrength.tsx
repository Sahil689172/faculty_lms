import { cn } from "../lib/cn";

interface Strength {
  score: number; // 0-4
  label: string;
  barClass: string;
  textClass: string;
}

function scorePassword(password: string): Strength {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const levels: Strength[] = [
    { score: 0, label: "Too weak", barClass: "bg-red-500", textClass: "text-red-500" },
    { score: 1, label: "Weak", barClass: "bg-red-500", textClass: "text-red-500" },
    { score: 2, label: "Fair", barClass: "bg-amber-500", textClass: "text-amber-500" },
    { score: 3, label: "Good", barClass: "bg-sky-500", textClass: "text-sky-500" },
    { score: 4, label: "Strong", barClass: "bg-emerald-500", textClass: "text-emerald-500" },
  ];

  return levels[score];
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) {
    return null;
  }

  const strength = scorePassword(password);

  return (
    <div className="space-y-1.5 pl-1">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              index < strength.score ? strength.barClass : "bg-slate-200 dark:bg-white/10",
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", strength.textClass)}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
