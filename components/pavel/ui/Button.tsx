import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Pill CTA matching the Fynix brand system: rounded-full, navy `primary` fill
 * for the main action, bordered white for the secondary. The `cta-primary` /
 * `cta-secondary` classes (defined in globals.css) add the shared hover/press
 * motion used across the rest of the site.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-3 font-medium rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover cta-primary shadow-sm",
    secondary:
      "bg-accent text-primary hover:bg-accent-hover cta-primary shadow-sm",
    outline:
      "bg-white text-primary border border-border hover:bg-background-soft cta-secondary",
    ghost:
      "bg-transparent text-primary hover:bg-background-soft border border-transparent",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[13px] tracking-tight",
    md: "px-6 py-3 text-sm tracking-tight",
    lg: "px-8 py-4 text-[15px] tracking-tight",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
