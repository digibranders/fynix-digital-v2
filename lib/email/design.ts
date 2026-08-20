/**
 * The Fynix email design system.
 *
 * One shell, one palette, one set of primitives, shared by every outbound mail
 * (contact, SEO audit, Pavel workshop, internal notifications). Before this
 * existed there were three separate looks in the codebase and two mails with no
 * styling at all, so a lead could receive a navy-headed 600px card on Monday and
 * a bare `<h2>` on Tuesday, both signed "Fynix Digital".
 *
 * Everything here is written for the LOWEST common denominator, which for email
 * is Outlook's Word rendering engine (no border-radius, no box-shadow, no
 * max-width, no background-image) and Gmail (strips `<link>`, blocks @font-face
 * and SVG images, keeps `<style>` and media queries). The rules that follow are
 * therefore not stylistic preferences:
 *
 *  - Tables for layout, inline styles for anything that must survive.
 *  - `<style>` in the head for the things inlining cannot express: responsive
 *    breakpoints and dark mode. Treated as progressive enhancement, never as
 *    the only place a color is defined.
 *  - Web-safe faces only. Georgia for the editorial headline voice, the system
 *    sans stack for body. No webfont loads in Gmail or Outlook, so asking for
 *    one just means an unpredictable fallback.
 *  - No 8-digit hex (`#E9AF8826`). Outlook drops the declaration entirely, so
 *    tints are pre-mixed opaque values.
 *  - No SVG in `<img>`. Gmail, Yahoo and every Outlook refuse to render it.
 *
 * @see DESIGN.md for the palette this derives from.
 */

/* -------------------------------------------------------------------------- */
/* Brand                                                                      */
/* -------------------------------------------------------------------------- */

export const BRAND = {
  name: "Fynix Digital",
  url: "https://fynix.digital",
  domain: "fynix.digital",
  email: "hello@fynix.digital",
  phone: "+91 789 789 6607",
  phoneHref: "+917897896607",
  instagram: "https://www.instagram.com/fynix_digital/",
  linkedin: "https://in.linkedin.com/company/fynixofficial",
} as const;

/**
 * The Fynix wordmark, exported from `components/Logo.tsx` by
 * `scripts/generate-email-logo.tsx`.
 *
 * PNG, not the SVG the masthead used to point at: no mainstream client renders
 * an SVG `<img>`, so Gmail (web, iOS, Android), Yahoo, AOL and every Outlook
 * showed a broken-image placeholder where the brand should have been.
 *
 * The file is served at 3x and displayed at `LOGO_WIDTH`, so it stays sharp on
 * retina without a second asset. It is the brand's primary navy, the same value
 * the site header uses, and sits on a masthead band that is pinned to cream in
 * both themes. That pairing is what keeps one asset correct everywhere: the
 * alternative is a light/dark image swap, which Gmail does not support.
 *
 * Absolute URL because an email has no origin to resolve a relative path
 * against. Regenerate the file after any change to the logo component.
 */
const LOGO_PNG_URL = `${BRAND.url}/email/logo.png`;
/** Display size. Must match `DISPLAY_WIDTH` in the generator script. */
const LOGO_WIDTH = 140;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH * (37 / 89));

/* -------------------------------------------------------------------------- */
/* Tokens                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every colour used in email, with its contrast budget already spent.
 *
 * Small text (below 18px) needs 4.5:1 against its background to clear WCAG AA,
 * and email is almost entirely small text. The two values that used to fail —
 * a #9AA0A6 footnote at 2.6:1 and a #9A7B4F accent at 4.0:1 used on 13px
 * semibold — are gone. `accent` is now surface-only and `accentInk` is the text
 * grade of the same hue at 5.2:1 on white.
 */
export const COLOR = {
  /** Page ground behind the card. */
  canvas: "#F4F2EE",
  /** The card itself. */
  surface: "#FFFFFF",
  /** Recessed panels inside the card, and the footer. */
  surfaceSoft: "#FAF9F6",
  /** Headlines, buttons, the masthead rule. */
  ink: "#0C1E2E",
  /** Body copy. 10.2:1 on white. */
  inkBody: "#3A424A",
  /** Labels, footer, secondary meta. 6.7:1 on white. */
  inkMuted: "#565D64",
  /** Warm peach. Surfaces, rules and tints ONLY, never text. */
  accent: "#E9AF88",
  /** Pre-mixed 12% peach on white. Opaque so Outlook keeps it. */
  accentWash: "#FCF3EB",
  /** Pre-mixed 30% peach on white, for tint borders. */
  accentEdge: "#F5DCC7",
  /** The text grade of the accent. 5.2:1 on white. */
  accentInk: "#8A6634",
  /** Hairlines, card borders, dividers. */
  border: "#E4E1DA",
  /** Divider inside recessed panels. */
  borderSoft: "#EDEAE3",
  /** Positive state, e.g. a confirmed seat. 4.9:1 on white. */
  positiveInk: "#1F6B3B",
  positiveWash: "#F1F7F2",
  positiveEdge: "#D2E6D8",
  onDark: "#FFFFFF",
} as const;

/** Dark-mode counterparts. Applied through the `<style>` block, not inline. */
const DARK = {
  canvas: "#101519",
  surface: "#191F25",
  surfaceSoft: "#1F262D",
  ink: "#F2F4F5",
  inkBody: "#C7CDD3",
  inkMuted: "#A3ABB3",
  accentInk: "#E9AF88",
  border: "#2C343C",
  /**
   * Tinted panels need a dark ground of their own. Without one they keep their
   * light wash while the text inside flips light, which is how a WhatsApp
   * panel ends up as pale grey copy on pale green.
   */
  accentWash: "#2B2119",
  accentEdge: "#48371F",
  positiveWash: "#15251A",
  positiveEdge: "#27412E",
  positiveInk: "#79CE93",
} as const;

/**
 * Body face. No webfont: Gmail blocks @font-face outright and Outlook falls back
 * to Times New Roman, so a declared webfont just makes the result less
 * predictable, not more branded.
 */
export const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Headline face. The site sets headlines in Figtree, which cannot load here, so
 * the editorial voice is carried by Georgia: web-safe on every desktop and
 * mobile client, and the closest thing email has to the brand's serif intent.
 */
export const FONT_SERIF = "Georgia, 'Times New Roman', Times, serif";

const FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Card width. 600px is the widest that never triggers Outlook's scaling. */
const SHELL_WIDTH = 600;
/** Horizontal padding inside the card on desktop. Drops to 24px on mobile. */
const GUTTER = 40;

/* -------------------------------------------------------------------------- */
/* Escaping                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Escape a value for interpolation into HTML text or an attribute.
 *
 * Every user-supplied value passes through this. It is not defensive
 * boilerplate: a registration name goes straight into a mail that our own
 * domain signs with DKIM, so an unescaped `<a>` in a name field produces a
 * convincing phishing link inside a message the recipient has every reason to
 * trust. The workshop and internal templates used to interpolate names,
 * websites and free-text answers raw.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape a multi-line value and preserve its line breaks. */
export function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

const SAFE_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

/**
 * Escape a URL for an `href`, rejecting anything that is not a link.
 *
 * A submitted website field lands in an anchor. Without a scheme check,
 * `javascript:` and `data:` values ride into the message; the desktop clients
 * that would execute them are a minority, but the cost of the check is nil and
 * the audit templates take the field verbatim from a public form.
 */
export function safeUrl(value: string, fallback = BRAND.url): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (!SAFE_SCHEMES.includes(parsed.protocol.toLowerCase())) return fallback;
    return escapeHtml(parsed.toString());
  } catch {
    return fallback;
  }
}

/** First name from a full name, with a neutral fallback for empty input. */
export function firstNameOf(name: string, fallback = "there"): string {
  return name.trim().split(/\s+/)[0] || fallback;
}

/* -------------------------------------------------------------------------- */
/* Document shell                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Gmail crops the preheader at roughly 100 characters and then keeps going into
 * the body copy, which is how "Thanks for reaching out" ends up followed by
 * "View this email in your browser Fynix Digital" in the inbox list. Padding it
 * with zero-width joiners fills the remaining space with nothing visible.
 */
function preheaderPadding(): string {
  return "&#847;&zwnj;&nbsp;".repeat(60);
}

/**
 * The head `<style>` block: responsive behaviour and dark mode.
 *
 * Gmail, Apple Mail, Outlook mobile and Outlook.com all honour an embedded
 * `<style>`; Outlook desktop ignores the media queries and keeps the inline
 * desktop values, which is the intended fallback. Nothing here is load-bearing
 * on its own — every colour and size is also set inline.
 */
function headStyles(): string {
  return `
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    @media only screen and (max-width: 620px) {
      .fx-shell { width: 100% !important; }
      .fx-gutter { padding-left: 24px !important; padding-right: 24px !important; }
      .fx-panel-gutter { padding-left: 18px !important; padding-right: 18px !important; }
      .fx-h1 { font-size: 26px !important; line-height: 1.24 !important; }
      .fx-lede { font-size: 16px !important; }
      .fx-stack, .fx-stack > tbody, .fx-stack > tbody > tr, .fx-stack > tbody > tr > td { display: block !important; width: 100% !important; }
      .fx-dt { padding-bottom: 3px !important; }
      .fx-dd { padding-top: 0 !important; padding-bottom: 16px !important; border-bottom: 0 !important; }
      .fx-btn a { display: block !important; width: auto !important; text-align: center !important; }
    }

    @media (prefers-color-scheme: dark) {
      .fx-canvas { background-color: ${DARK.canvas} !important; }
      .fx-card { background-color: ${DARK.surface} !important; border-color: ${DARK.border} !important; }
      .fx-soft { background-color: ${DARK.surfaceSoft} !important; border-color: ${DARK.border} !important; }
      .fx-wash-accent { background-color: ${DARK.accentWash} !important; border-color: ${DARK.accentEdge} !important; }
      .fx-wash-positive { background-color: ${DARK.positiveWash} !important; border-color: ${DARK.positiveEdge} !important; }
      .fx-positive-text { color: ${DARK.positiveInk} !important; }
      .fx-ink, .fx-ink a { color: ${DARK.ink} !important; }
      .fx-body-text { color: ${DARK.inkBody} !important; }
      .fx-muted, .fx-muted a { color: ${DARK.inkMuted} !important; }
      .fx-accent-text { color: ${DARK.accentInk} !important; }
      .fx-rule { background-color: ${DARK.border} !important; }
      .fx-hairline { border-color: ${DARK.border} !important; }
      .fx-btn-primary { background-color: ${COLOR.accent} !important; }
      .fx-btn-primary a { color: ${COLOR.ink} !important; }
    }

    /*
     * Outlook.com and the Windows Outlook web view do not honour
     * prefers-color-scheme. They stamp their own attribute on the wrapper and
     * force-invert what they can reach, which lands mid-way: a dark card with
     * the body copy left at its light value. Repeating the palette against
     * their hook is the only way to finish the job.
     */
    [data-ostype="default"] .fx-canvas { background-color: ${DARK.canvas} !important; }
    [data-ostype="default"] .fx-card { background-color: ${DARK.surface} !important; border-color: ${DARK.border} !important; }
    [data-ostype="default"] .fx-soft { background-color: ${DARK.surfaceSoft} !important; border-color: ${DARK.border} !important; }
    [data-ostype="default"] .fx-wash-accent { background-color: ${DARK.accentWash} !important; border-color: ${DARK.accentEdge} !important; }
    [data-ostype="default"] .fx-wash-positive { background-color: ${DARK.positiveWash} !important; border-color: ${DARK.positiveEdge} !important; }
    [data-ostype="default"] .fx-ink, [data-ostype="default"] .fx-ink a { color: ${DARK.ink} !important; }
    [data-ostype="default"] .fx-body-text { color: ${DARK.inkBody} !important; }
    [data-ostype="default"] .fx-muted, [data-ostype="default"] .fx-muted a { color: ${DARK.inkMuted} !important; }
    [data-ostype="default"] .fx-accent-text { color: ${DARK.accentInk} !important; }
    [data-ostype="default"] .fx-positive-text { color: ${DARK.positiveInk} !important; }
    [data-ostype="default"] .fx-rule { background-color: ${DARK.border} !important; }
    [data-ostype="default"] .fx-hairline { border-color: ${DARK.border} !important; }
  `;
}

export interface EmailDocumentOptions {
  /** Used for the `<title>`. Pass the subject line. */
  title: string;
  /** Inbox preview text. Should not repeat the subject. */
  preheader: string;
  /** Rows of the card body, already wrapped in `<tr>`. */
  bodyRows: string;
  /**
   * Prefix for the footer's copyright line, e.g. a reference id or an internal
   * marker. Already escaped. Omitted entirely when absent, rather than printed
   * as a placeholder.
   */
  footerMeta?: string;
}

/**
 * Wrap card rows in the full document: doctype, head, Outlook shims, the
 * centred card, the masthead and the footer.
 *
 * The card is sized `width:100%; max-width:600px` inline rather than a fixed
 * `600px`, and the Outlook conditional wrapper supplies the fixed width that
 * the Word engine needs because it ignores `max-width`.
 *
 * That split matters. A fixed inline width relies on the `<style>` block's
 * media query to shrink it, and the Gmail app strips `<style>` entirely for
 * accounts that are not Gmail (Yahoo, iCloud and any IMAP address added to it).
 * Those readers get no media query, so a hard 600px is a 600px card on a 375px
 * phone: horizontal scrolling, with the right-hand third of every line cut off.
 * Sized this way the layout degrades on its own and the media query only
 * refines it.
 */
export function renderEmailDocument(options: EmailDocumentOptions): string {
  const { title, preheader, bodyRows, footerMeta } = options;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>${headStyles()}</style>
</head>
<body class="fx-canvas" style="margin:0;padding:0;width:100%;background-color:${COLOR.canvas};">
<div style="display:none;font-size:1px;color:${COLOR.canvas};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}${preheaderPadding()}</div>
<table role="presentation" class="fx-canvas" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${COLOR.canvas}" style="background-color:${COLOR.canvas};">
  <tr>
    <td align="center" style="padding:32px 12px 40px 12px;">
      <!--[if mso]><table role="presentation" width="${SHELL_WIDTH}" border="0" cellpadding="0" cellspacing="0" align="center"><tr><td><![endif]-->
      <table role="presentation" class="fx-shell fx-card" border="0" cellpadding="0" cellspacing="0" bgcolor="${COLOR.surface}" style="width:100%;max-width:${SHELL_WIDTH}px;margin:0 auto;background-color:${COLOR.surface};border:1px solid ${COLOR.border};border-radius:14px;">
        ${masthead()}
        ${bodyRows}
        ${emailFooter(footerMeta)}
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Masthead band.
 *
 * The same value as the footer band, not a second near-white. It was `#FCFCFB`
 * against the footer's `#FAF9F6`, a two-point difference that is invisible on
 * its own and reads as a smudge when the two bands sit in one message.
 *
 * It is a literal rather than `COLOR.surfaceSoft` because the two have
 * different jobs: the footer follows the theme, this band never does. Aliasing
 * them would invite a dark-mode rule that breaks the logo. See `masthead()`.
 */
const MASTHEAD_BG = COLOR.surfaceSoft;

/**
 * The masthead: a navy rule, then the brand-navy wordmark on cream, linked to
 * the site.
 *
 * The band carries no `fx-` class, so no dark-mode rule touches it. That is
 * deliberate. The logo is a fixed-colour image and cannot recolour itself, so
 * pinning its ground is the only way one asset reads correctly in both themes,
 * and it stops Apple Mail and Outlook.com inverting the one element whose
 * colours are the brand's. It reads as letterhead, which is the intent.
 *
 * `alt` is the company name, so a client with images blocked, which is the
 * default in Outlook desktop and much of corporate mail, still shows who sent
 * it rather than an empty box. The inline type styles on the `<img>` are what
 * that alt text is rendered in.
 */
function masthead(): string {
  return `<tr>
    <td height="4" bgcolor="${COLOR.ink}" style="height:4px;line-height:4px;font-size:0;background-color:${COLOR.ink};border-radius:14px 14px 0 0;">&nbsp;</td>
  </tr>
  <tr>
    <td class="fx-gutter" align="left" bgcolor="${MASTHEAD_BG}" style="padding:22px ${GUTTER}px;background-color:${MASTHEAD_BG};border-bottom:1px solid ${COLOR.border};">
      <a href="${BRAND.url}" style="display:inline-block;text-decoration:none;" title="${escapeHtml(BRAND.name)}">
        <img src="${escapeHtml(LOGO_PNG_URL)}" alt="${escapeHtml(BRAND.name)}" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" style="display:block;width:${LOGO_WIDTH}px;height:${LOGO_HEIGHT}px;border:0;outline:none;text-decoration:none;font-family:${FONT_SERIF};font-size:19px;font-weight:700;letter-spacing:0.1em;color:${COLOR.ink};" />
      </a>
    </td>
  </tr>`;
}

/**
 * One footer, identical in every email.
 *
 * Three lines, always in this order and always in these styles: contact, then
 * social, then the copyright line. Only the copyright line varies, and only by
 * an optional prefix such as a reference id.
 *
 * This is the point of the component. Before it there were three footers: the
 * website forms carried a centred contact line with SVG social icons that Gmail
 * could not render, the workshop mails carried a left-aligned contact line with
 * a reference and no social links at all, and the two internal notifications had
 * no footer whatsoever. A reader who received two of them saw two companies.
 *
 * Deliberately absent: an unsubscribe link. Every email here is transactional,
 * sent in response to something the recipient did, so a list-unsubscribe would
 * be both misleading and unenforceable. The first genuinely promotional send
 * needs one, plus a postal address, and needs them added here rather than in a
 * single template.
 */
function emailFooter(footerMeta: string | undefined): string {
  const year = new Date().getFullYear();
  const copyright = footerMeta
    ? `${footerMeta} &nbsp;&middot;&nbsp; &copy; ${year} ${escapeHtml(BRAND.name)}`
    : `&copy; ${year} ${escapeHtml(BRAND.name)}`;

  return `<tr>
    <td class="fx-gutter fx-soft fx-hairline" bgcolor="${COLOR.surfaceSoft}" style="padding:24px ${GUTTER}px 26px ${GUTTER}px;background-color:${COLOR.surfaceSoft};border-top:1px solid ${COLOR.border};border-radius:0 0 14px 14px;">
      <p class="fx-muted" style="margin:0 0 10px;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${COLOR.inkMuted};">
        Questions? Reply to this email, write to
        <a href="mailto:${BRAND.email}" style="color:${COLOR.inkMuted};text-decoration:underline;">${BRAND.email}</a>,
        or call <a href="tel:${BRAND.phoneHref}" style="color:${COLOR.inkMuted};text-decoration:underline;">${escapeHtml(BRAND.phone)}</a>.
      </p>
      <p class="fx-muted" style="margin:0 0 10px;font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${COLOR.inkMuted};">
        <a href="${BRAND.instagram}" style="color:${COLOR.inkMuted};text-decoration:underline;">Instagram</a>
        &nbsp;&middot;&nbsp;
        <a href="${BRAND.linkedin}" style="color:${COLOR.inkMuted};text-decoration:underline;">LinkedIn</a>
        &nbsp;&middot;&nbsp;
        <a href="${BRAND.url}" style="color:${COLOR.inkMuted};text-decoration:underline;">${BRAND.domain}</a>
      </p>
      <p class="fx-muted" style="margin:0;font-family:${FONT_SANS};font-size:11px;line-height:1.6;color:${COLOR.inkMuted};">${copyright}</p>
    </td>
  </tr>`;
}

/* -------------------------------------------------------------------------- */
/* Body primitives                                                            */
/* -------------------------------------------------------------------------- */

/** A full-width body row with the standard gutters. */
export function row(innerHtml: string, padding = `32px ${GUTTER}px 8px ${GUTTER}px`): string {
  return `<tr><td class="fx-gutter" style="padding:${padding};">${innerHtml}</td></tr>`;
}

/** Uppercase mono-ish label above a headline. Pass pre-escaped HTML. */
export function eyebrow(text: string): string {
  return `<p class="fx-muted" style="margin:0 0 14px;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${COLOR.inkMuted};">${text}</p>`;
}

/**
 * The headline. `emphasis` is set in italic accent, the one expressive move the
 * brand allows, and is escaped here so a name can safely carry it.
 */
export function heading(text: string, emphasis?: string): string {
  const accent = emphasis
    ? ` <span class="fx-accent-text" style="font-style:italic;color:${COLOR.accentInk};">${escapeHtml(emphasis)}</span>`
    : "";
  return `<h1 class="fx-h1 fx-ink" style="margin:0;font-family:${FONT_SERIF};font-size:31px;line-height:1.2;font-weight:400;letter-spacing:-0.01em;color:${COLOR.ink};mso-line-height-rule:exactly;">${escapeHtml(text)}${accent}</h1>`;
}

/** Opening sentence, one step up from body copy. Pass pre-escaped HTML. */
export function lede(html: string): string {
  return `<p class="fx-lede fx-body-text" style="margin:0 0 18px;font-family:${FONT_SANS};font-size:17px;line-height:1.65;color:${COLOR.inkBody};mso-line-height-rule:exactly;">${html}</p>`;
}

/** Body paragraph. Pass pre-escaped HTML. */
export function paragraph(html: string, marginBottom = 18): string {
  return `<p class="fx-body-text" style="margin:0 0 ${marginBottom}px;font-family:${FONT_SANS};font-size:15px;line-height:1.7;color:${COLOR.inkBody};mso-line-height-rule:exactly;">${html}</p>`;
}

/** Inline link in body copy. */
export function link(href: string, label: string): string {
  return `<a class="fx-ink" href="${safeUrl(href)}" style="color:${COLOR.ink};font-weight:600;text-decoration:underline;">${escapeHtml(label)}</a>`;
}

/** Hairline divider. */
export function divider(margin = 28): string {
  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:${margin}px 0;"><tr><td class="fx-rule" height="1" bgcolor="${COLOR.border}" style="height:1px;line-height:1px;font-size:0;background-color:${COLOR.border};">&nbsp;</td></tr></table>`;
}

export type ButtonTone = "primary" | "positive";

/**
 * Bulletproof call to action.
 *
 * Outlook's Word engine ignores `border-radius` and collapses padding on an
 * anchor, so a styled `<a>` alone renders there as bare underlined text. The
 * VML `roundrect` is the shim; the anchor is what every other client sees. The
 * VML needs a pixel width up front, hence the estimate from the label.
 */
export function button(href: string, label: string, tone: ButtonTone = "primary"): string {
  const url = safeUrl(href);
  const fill = tone === "positive" ? COLOR.positiveInk : COLOR.ink;
  const width = Math.max(180, Math.round(label.length * 8.6) + 52);
  const toneClass = tone === "primary" ? "fx-btn-primary" : "";

  return `<div class="fx-btn" style="margin:4px 0 24px;">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:46px;v-text-anchor:middle;width:${width}px;" arcsize="50%" stroke="f" fillcolor="${fill}">
      <w:anchorlock/>
      <center style="color:${COLOR.onDark};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${escapeHtml(label)}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <table role="presentation" class="${toneClass}" border="0" cellpadding="0" cellspacing="0" bgcolor="${fill}" style="background-color:${fill};border-radius:999px;">
      <tr>
        <td align="center" style="border-radius:999px;">
          <a href="${url}" style="display:inline-block;padding:14px 30px;font-family:${FONT_SANS};font-size:15px;font-weight:600;line-height:1;color:${COLOR.onDark};text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
    <!--<![endif]-->
  </div>`;
}

export type PanelTone = "neutral" | "accent" | "positive";

const PANEL_TONES: Record<PanelTone, { bg: string; border: string; className: string }> = {
  neutral: { bg: COLOR.surfaceSoft, border: COLOR.border, className: "fx-soft" },
  accent: { bg: COLOR.accentWash, border: COLOR.accentEdge, className: "fx-wash-accent" },
  positive: { bg: COLOR.positiveWash, border: COLOR.positiveEdge, className: "fx-wash-positive" },
};

/** Recessed panel for grouped detail. Pass pre-escaped HTML. */
export function panel(innerHtml: string, tone: PanelTone = "neutral"): string {
  const { bg, border, className } = PANEL_TONES[tone];

  return `<table role="presentation" class="${className}" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${bg}" style="margin:0 0 22px;background-color:${bg};border:1px solid ${border};border-radius:12px;">
    <tr><td class="fx-panel-gutter" style="padding:20px 22px;">${innerHtml}</td></tr>
  </table>`;
}

/** Label for a positive-tone panel, e.g. the attendees-only community block. */
export function positiveLabel(text: string): string {
  return `<p class="fx-positive-text" style="margin:0 0 5px;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR.positiveInk};">${escapeHtml(text)}</p>`;
}

/** Small uppercase label inside a panel. */
export function panelLabel(text: string, marginTop = 0): string {
  return `<p class="fx-muted" style="margin:${marginTop}px 0 5px;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR.inkMuted};">${escapeHtml(text)}</p>`;
}

/** The value beneath a `panelLabel`. Pass pre-escaped HTML. */
export function panelValue(html: string, marginBottom = 16): string {
  return `<p class="fx-ink" style="margin:0 0 ${marginBottom}px;font-family:${FONT_SANS};font-size:16px;line-height:1.5;color:${COLOR.ink};">${html}</p>`;
}

export interface DetailRow {
  label: string;
  /** Pre-escaped HTML. */
  value: string;
}

/**
 * Label/value table for internal notifications.
 *
 * The label column is fixed at 128px on desktop and collapses to a stacked
 * layout under 620px, because a 128px column plus a long address on a 320px
 * screen left the value wrapping one word per line.
 */
export function detailList(rows: DetailRow[]): string {
  const cells = rows
    .map(
      ({ label, value }, index) => `<tr class="fx-stack">
      <td class="fx-dt fx-muted fx-hairline" width="128" style="width:128px;padding:${index === 0 ? "0" : "14px"} 12px 14px 0;${index === 0 ? "" : `border-top:1px solid ${COLOR.borderSoft};`}font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR.inkMuted};vertical-align:top;">${escapeHtml(label)}</td>
      <td class="fx-dd fx-ink fx-hairline" style="padding:${index === 0 ? "0" : "14px"} 0 14px 0;${index === 0 ? "" : `border-top:1px solid ${COLOR.borderSoft};`}font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${COLOR.ink};vertical-align:top;">${value}</td>
    </tr>`
    )
    .join("");

  return `<table role="presentation" class="fx-stack" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tbody>${cells}</tbody></table>`;
}

/**
 * Tag row, e.g. the services a lead selected.
 *
 * The tint is a pre-mixed opaque value. The previous version used `#E9AF8826`,
 * an 8-digit hex that Outlook discards entirely, so the tags lost their
 * background and border there and read as loose words.
 */
export function tags(values: readonly string[], emptyLabel = "Not specified"): string {
  if (values.length === 0) {
    return `<span class="fx-muted" style="font-family:${FONT_SANS};font-size:15px;color:${COLOR.inkMuted};">${escapeHtml(emptyLabel)}</span>`;
  }

  return values
    .map(
      (value) =>
        `<span class="fx-wash-accent fx-accent-text" style="display:inline-block;margin:0 6px 6px 0;padding:6px 13px;font-family:${FONT_SANS};font-size:12px;font-weight:600;line-height:1;color:${COLOR.accentInk};background-color:${COLOR.accentWash};border:1px solid ${COLOR.accentEdge};border-radius:999px;">${escapeHtml(value)}</span>`
    )
    .join("");
}

/**
 * Checklist. Uses a two-cell table rather than `<ul>`: Outlook renders list
 * indentation unpredictably and strips the marker colour.
 */
export function bulletList(items: readonly string[]): string {
  const rows = items
    .map(
      (item) => `<tr>
      <td width="16" style="width:16px;padding:0 0 9px 0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${COLOR.accentInk};vertical-align:top;" class="fx-accent-text">&bull;</td>
      <td class="fx-body-text" style="padding:0 0 9px 0;font-family:${FONT_SANS};font-size:15px;line-height:1.6;color:${COLOR.inkBody};">${escapeHtml(item)}</td>
    </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">${rows}</table>`;
}

/**
 * A long URL printed for copy-and-paste beneath a button.
 *
 * Tokenised Zoom links run past 100 characters and every client that blocks the
 * button's styling still needs the destination to be reachable.
 */
export function fallbackLink(url: string, prefix = "If the button does not work, copy this link into your browser:"): string {
  const safe = safeUrl(url);
  // Both wrap properties, deliberately. Outlook's Word engine does not
  // implement `word-break`, so on its own a 120-character tokenised Zoom URL
  // is one unbreakable word that widens the table past 600px and pushes the
  // whole message off the right edge. `word-wrap` is the property Word honours.
  return `<p class="fx-muted" style="margin:0 0 18px;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${COLOR.inkMuted};word-wrap:break-word;">
    ${escapeHtml(prefix)}<br />
    <a class="fx-ink" href="${safe}" style="color:${COLOR.ink};text-decoration:underline;word-wrap:break-word;word-break:break-all;">${safe}</a>
  </p>`;
}

/** Monospaced value, for passcodes and reference ids. */
export function code(value: string): string {
  return `<strong class="fx-ink" style="font-family:${FONT_MONO};font-size:15px;letter-spacing:0.04em;color:${COLOR.ink};">${escapeHtml(value)}</strong>`;
}

/** Closing signature block. */
export function signOff(closing: string, team = `The ${BRAND.name} Team`): string {
  return `<p class="fx-ink" style="margin:0 0 4px;font-family:${FONT_SERIF};font-style:italic;font-size:17px;line-height:1.5;color:${COLOR.ink};">${escapeHtml(closing)}</p>
  <p class="fx-ink" style="margin:0;font-family:${FONT_SANS};font-size:13px;font-weight:600;letter-spacing:0.03em;color:${COLOR.ink};">${escapeHtml(team)}</p>`;
}

/* -------------------------------------------------------------------------- */
/* Calendar                                                                   */
/* -------------------------------------------------------------------------- */

/** `YYYYMMDDTHHMMSSZ`, the only shape both calendar providers accept. */
function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * "Add to calendar" links for the two providers that cover most recipients.
 *
 * An `.ics` attachment would cover the rest, but Brevo attachments are shared
 * with the invoice path and a calendar file that disagrees with a rescheduled
 * session is worse than a link that always resolves to the current one.
 */
export function calendarLinks(event: {
  title: string;
  startUtc: string;
  endUtc: string;
  details: string;
  location: string;
}): { google: string; outlook: string } {
  const start = toCalendarStamp(event.startUtc);
  const end = toCalendarStamp(event.endUtc);

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${start}/${end}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;

  const outlook = `https://outlook.live.com/calendar/0/action/compose?rru=addevent&subject=${encodeURIComponent(
    event.title
  )}&startdt=${new Date(event.startUtc).toISOString()}&enddt=${new Date(
    event.endUtc
  ).toISOString()}&body=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;

  return { google, outlook };
}

/** The paired calendar links, rendered as a quiet secondary action. */
export function calendarRow(event: Parameters<typeof calendarLinks>[0]): string {
  const { google, outlook } = calendarLinks(event);
  return `<p class="fx-muted" style="margin:0;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${COLOR.inkMuted};">
    Add to
    <a class="fx-ink" href="${safeUrl(google)}" style="color:${COLOR.ink};font-weight:600;text-decoration:underline;">Google Calendar</a>
    or
    <a class="fx-ink" href="${safeUrl(outlook)}" style="color:${COLOR.ink};font-weight:600;text-decoration:underline;">Outlook</a>.
  </p>`;
}
