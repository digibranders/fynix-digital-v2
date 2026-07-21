import { Fragment, type ReactNode } from "react";

/**
 * Renders inline `**phrase**` markers as <strong>, leaving the rest of the
 * string untouched. Content is fully authored by us, so this is safe without
 * a full markdown parser.
 */
export function emphasize(
  text: string,
  strongClassName = "font-medium text-primary",
): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className={strongClassName}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
