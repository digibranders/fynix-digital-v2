import type { ReactNode } from "react";

/**
 * The console's primitives.
 *
 * One file rather than a directory of eight, because each of these is a few
 * lines of class names and splitting them made the imports longer than the
 * components. They are deliberately dumb: no state, no data, no server actions.
 * Anything that needs `useFormStatus` or `useActionState` stays in its own
 * client component, because a shared button that called those hooks would
 * silently report `pending: false` everywhere it was used outside a form.
 */

/* ------------------------------------------------------------------ layout */

/** A white panel with a hairline. The console's only card family. */
export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={`relative rounded-xl border border-border bg-console-surface ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * A card's header row: eyebrow, title, and whatever sits on the right.
 *
 * The eyebrow is the site's mono label treatment, which is what keeps the
 * console reading as the same product as the marketing pages.
 */
export function CardHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent-strong">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-sm font-semibold text-primary">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

/**
 * A labelled group of fields inside a card.
 *
 * Rendered as a `fieldset` so the label is announced with the controls it
 * covers. It takes no `form` of its own: the session panel needs each group to
 * BE a form (one server action each), and a wrapper form here would nest them,
 * which browsers resolve by silently dropping the inner one.
 */
export function FieldGroup({
  legend,
  hint,
  children,
  className = "",
}: {
  legend: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset
      className={`rounded-lg border border-border bg-console-sunken px-4 py-3 ${className}`}
    >
      <legend className="px-1 font-mono text-[11px] uppercase tracking-widest text-text-muted">
        {legend}
      </legend>
      {hint ? <p className="mb-2 text-xs text-text-muted">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ status */

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const BADGE_TONE: Record<Tone, string> = {
  neutral: "bg-console-sunken text-text-muted",
  success: "bg-success-surface text-success",
  warning: "bg-warning-surface text-warning",
  danger: "bg-danger-surface text-danger",
  info: "bg-info-surface text-info",
};

/** A small state label. Always carries a word, never colour alone. */
export function Badge({
  tone = "neutral",
  children,
  title,
}: {
  tone?: Tone;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

const ALERT_TONE: Record<Tone, string> = {
  neutral: "border-border bg-console-sunken text-foreground",
  success: "border-success/25 bg-success-surface text-success",
  warning: "border-warning/25 bg-warning-surface text-warning",
  danger: "border-danger/25 bg-danger-surface text-danger",
  info: "border-info/25 bg-info-surface text-info",
};

/**
 * An inline message.
 *
 * `role="status"` with a polite live region by default, because most of these
 * report the outcome of something the operator just pressed: a screen reader
 * user who does not hear it has no way to know whether the action worked.
 * Errors that were present on load rather than produced by an action pass
 * `live={false}`, so the page does not announce itself on arrival.
 */
export function Alert({
  tone = "neutral",
  icon,
  children,
  live = true,
  className = "",
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  live?: boolean;
  className?: string;
}) {
  return (
    <p
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${ALERT_TONE[tone]} ${className}`}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ empty  */

/**
 * Nothing to show, and why.
 *
 * "No results" and "nothing exists yet" are different answers to different
 * questions, and a single blank row makes the operator guess which one they are
 * looking at, so the caller always supplies both the reason and the way out.
 */
export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-14 text-center ${className}`}>
      <p className="text-sm font-medium text-primary">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- skeletons */

/**
 * A loading placeholder.
 *
 * `.console-skeleton` rather than Tailwind's `animate-pulse`: the global
 * reduced-motion rule only shortens an animation's duration, which leaves a
 * pulse flickering at whatever opacity it froze on instead of stopping.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`console-skeleton block rounded ${className}`}
    />
  );
}

/* ----------------------------------------------------------------- button  */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "border border-primary bg-primary text-white hover:bg-primary-hover disabled:hover:bg-primary",
  secondary:
    "border border-console-control bg-console-surface text-primary hover:bg-console-sunken",
  ghost:
    "border border-transparent bg-transparent text-text-muted hover:border-border hover:bg-console-sunken hover:text-primary",
  danger:
    "border border-danger/40 bg-console-surface text-danger hover:bg-danger-surface",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-lg px-2.5 py-1 text-xs",
  md: "gap-2 rounded-lg px-3.5 py-2 text-sm",
};

/**
 * The console's button shape.
 *
 * Note what this does NOT do: it never calls `useFormStatus`. That hook reads
 * the form the button sits in, and a shared button that called it would return
 * `pending: false` for every button rendered outside one — quietly removing the
 * in-flight feedback from every control that is not a submit. `SubmitButton`
 * stays the single form-aware button, and takes these class names by hand.
 *
 * The console is not pill-shaped. Rounded-full is the site's CTA language and
 * reads as marketing on a data tool; small radii read as controls.
 */
export function buttonClass(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  className = ""
): string {
  return `console-focus inline-flex shrink-0 items-center justify-center font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${SIZE[size]} ${VARIANT[variant]} ${className}`;
}

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ figures */

/**
 * One headline figure.
 *
 * The value is rendered as a block per line so a two-currency total stacks
 * ("₹41,589" over "+ $99") instead of running along one line and pushing every
 * neighbouring figure out of alignment.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  size = "md",
}: {
  label: string;
  /** Pre-split lines. One entry renders as a single figure. */
  value: string | string[];
  hint?: string;
  tone?: Tone;
  size?: "md" | "lg";
}) {
  const lines = Array.isArray(value) ? value : [value];
  const colour =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-primary";
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1.5 font-semibold tabular-nums ${colour} ${
          size === "lg" ? "text-2xl" : "text-lg"
        }`}
      >
        {lines.map((line, index) => (
          <span
            key={line}
            className={`block leading-tight ${
              index > 0 ? "text-base font-medium text-text-muted" : ""
            }`}
          >
            {line}
          </span>
        ))}
      </dd>
      {hint ? (
        <p className="mt-1 text-xs leading-snug text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** A label/value pair in a breakdown list. */
export function FigureRow({
  label,
  value,
  hint,
  emphasis = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  tone?: Tone;
}) {
  const colour =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-primary";
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${
        emphasis ? "border-t border-border pt-2.5" : ""
      }`}
    >
      <dt className="min-w-0 text-xs text-text-muted">
        {label}
        {hint ? (
          <span className="mt-0.5 block text-[11px] leading-snug text-text-muted/80">
            {hint}
          </span>
        ) : null}
      </dt>
      <dd
        className={`shrink-0 text-right tabular-nums ${colour} ${
          emphasis ? "text-sm font-semibold" : "text-sm font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
