import React from "react";
import Logo from "@/components/Logo";
import { WORKSHOP } from "./workshopDetails";

export interface CertificateProps {
  /** Full name of the person the certificate is awarded to. */
  recipientName: string;
  /** Unique credential reference, e.g. `FYX-SS26-0184`. */
  credentialId: string;
  /** Human-readable completion date, e.g. `5 September 2026`. */
  issueDate: string;
}

/**
 * Certification stamp recreated faithfully from reference image:
 * - Double concentric copper rings
 * - Arched bold uppercase typography:
 *   'SEMANTIC SEO MASTERCLASS' (top) & 'POWERED BY FYNIX DIGITAL' (bottom)
 * - Centered official Fynix 'F' monogram mark
 * - Classical botanical laurel wreath with 6 paired leaves + terminal tip on each side
 */
const Seal: React.FC<{ className?: string }> = ({ className }) => {
  // Classical botanical leaf pairs along the curved laurel branch
  const leafNodes = [
    { x: 93.5, y: 134.5, innerRot: 16, outerRot: 78, scale: 0.88 },
    { x: 84.5, y: 130.5, innerRot: 2, outerRot: 62, scale: 0.96 },
    { x: 75.0, y: 123.5, innerRot: -14, outerRot: 44, scale: 1.04 },
    { x: 67.0, y: 114.0, innerRot: -28, outerRot: 28, scale: 1.06 },
    { x: 61.2, y: 102.5, innerRot: -44, outerRot: 14, scale: 1.0 },
    { x: 58.2, y: 91.0, innerRot: -60, outerRot: -2, scale: 0.92 },
  ];

  return (
    <div className={className}>
      <svg className="cert__seal-art" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          {/* Top text arc (clockwise convex) */}
          <path id="seal-text-arc-top" d="M 27,100 A 73,73 0 0,1 173,100" fill="none" />
          {/* Bottom text arc (counter-clockwise concave, upright lettering) */}
          <path id="seal-text-arc-bot" d="M 28,100 A 72,72 0 0,0 172,100" fill="none" />

          {/* Reusable left branch template for 100% symmetrical mirroring */}
          <g id="seal-laurel-branch" fill="currentColor">
            {/* Smooth stem curve */}
            <path
              d="M 98,136 C 76,134 58,117 58,89"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Paired almond leaf sets */}
            {leafNodes.map((n, i) => (
              <g key={i}>
                {/* Inner leaf */}
                <path
                  d="M 0,0 C -1.6,-1.5 -2.1,-4.8 0,-7.2 C 2.1,-4.8 1.6,-1.5 0,0 Z"
                  transform={`translate(${n.x}, ${n.y}) rotate(${n.innerRot}) scale(${n.scale * 0.92})`}
                />
                {/* Outer leaf */}
                <path
                  d="M 0,0 C -2.0,-2.0 -2.5,-6.0 0,-8.8 C 2.5,-6.0 2.0,-2.0 0,0 Z"
                  transform={`translate(${n.x}, ${n.y}) rotate(${n.outerRot}) scale(${n.scale * 1.04})`}
                />
              </g>
            ))}
            {/* Top terminal tip leaf */}
            <path
              d="M 0,0 C -1.8,-1.8 -2.0,-5.2 0,-7.8 C 2.0,-5.2 1.8,-1.8 0,0 Z"
              transform="translate(58, 81) rotate(-78) scale(0.9)"
            />
          </g>
        </defs>

        {/* Double concentric outer boundary rings */}
        <circle cx="100" cy="100" r="93.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="100" cy="100" r="86.5" fill="none" stroke="currentColor" strokeWidth="1.1" />

        {/* Arched bold typography */}
        <g
          fill="currentColor"
          fontFamily="var(--font-sans), 'Figtree', system-ui, sans-serif"
          fontWeight="800"
        >
          <text fontSize="10.2" letterSpacing="2.3">
            <textPath href="#seal-text-arc-top" startOffset="50%" textAnchor="middle">
              SEMANTIC SEO MASTERCLASS
            </textPath>
          </text>
          <text fontSize="8.2" letterSpacing="1.9">
            <textPath href="#seal-text-arc-bot" startOffset="50%" textAnchor="middle">
              POWERED BY FYNIX DIGITAL
            </textPath>
          </text>
        </g>

        {/* Laurel wreath: left branch + mirrored right branch */}
        <use href="#seal-laurel-branch" />
        <use href="#seal-laurel-branch" transform="translate(200, 0) scale(-1, 1)" />

        {/* Base crossover flourish */}
        <path
          d="M 95,138 C 98,141 102,142 105,142 M 105,138 C 102,141 98,142 95,142"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Center Fynix 'F' monogram icon */}
        <g transform="translate(81.6, 58) scale(1.45)" fill="currentColor">
          {/* Top aerodynamic wing */}
          <path d="M8.39236 0.00110456C8.48294 0.00140944 8.57352 0.00119579 8.66409 0.00105437C8.82209 0.000876037 8.98007 0.00101371 9.13806 0.00137057C9.37298 0.00189969 9.6079 0.00192079 9.84282 0.00184492C10.2382 0.00173128 10.6335 0.00201903 11.0289 0.00254171C11.4199 0.00305733 11.8109 0.00339075 12.2019 0.00348493C12.2263 0.0034909 12.2507 0.00349688 12.2758 0.00350303C12.3997 0.00353244 12.5235 0.00355863 12.6474 0.00358359C13.5228 0.00376576 14.3982 0.00435025 15.2736 0.00517426C16.1237 0.00597347 16.9738 0.00658862 17.8238 0.00695659C17.8632 0.00697374 17.8632 0.00697374 17.9033 0.00699123C18.1668 0.00710583 18.4304 0.00721671 18.6939 0.00732487C19.2306 0.00754524 19.7673 0.00779044 20.304 0.00805066C20.3287 0.00806259 20.3534 0.00807452 20.3788 0.00808681C22.0243 0.0088854 23.6698 0.0102624 25.3153 0.0117307C25.3153 0.0885618 25.3154 0.165393 25.3154 0.242224C25.3154 0.263882 25.3154 0.28554 25.3155 0.307854C25.3157 1.15565 25.155 1.96921 24.8817 2.76957C24.8666 2.81389 24.8519 2.85832 24.8375 2.90286C24.7887 3.05384 24.7317 3.19906 24.6676 3.34418C24.6581 3.36585 24.6486 3.38752 24.6388 3.40984C24.5652 3.57638 24.4862 3.7391 24.4027 3.90094C24.3945 3.91839 24.3862 3.93584 24.3777 3.95382C24.2635 4.19483 24.1124 4.41801 23.971 4.64374C23.9498 4.6778 23.9288 4.71202 23.9079 4.74628C23.8395 4.85709 23.7682 4.95594 23.6803 5.0519C23.6383 5.10058 23.6025 5.15147 23.5662 5.20459C23.4968 5.30579 23.4209 5.3966 23.3381 5.48705C23.3208 5.50612 23.3034 5.52519 23.2856 5.54484C23.2497 5.58426 23.2138 5.62362 23.1779 5.6629C23.1347 5.71066 23.0925 5.75886 23.0506 5.80761C22.9604 5.91084 22.8647 6.00808 22.7678 6.10492C22.7496 6.12312 22.7314 6.14131 22.7126 6.16006C22.5864 6.28512 22.4574 6.3994 22.3169 6.50824C22.2873 6.53387 22.2579 6.55966 22.2286 6.58564C22.1648 6.6386 22.1648 6.6386 22.1214 6.6386C22.1142 6.66011 22.107 6.68162 22.0996 6.70378C22.0552 6.73578 22.0552 6.73578 21.9964 6.77032C21.899 6.82999 21.8089 6.89389 21.7194 6.96451C21.5801 7.07381 21.4369 7.17683 21.2778 7.25563C21.1952 7.29729 21.1169 7.34457 21.0377 7.39227C19.6896 8.1946 18.1395 8.48984 16.5882 8.48809C16.4997 8.48801 16.4112 8.48807 16.3227 8.4881C16.1678 8.48815 16.0129 8.48811 15.8581 8.48802C15.6278 8.48789 15.3975 8.48789 15.1673 8.4879C14.7799 8.48793 14.3924 8.48786 14.005 8.48773C13.6216 8.4876 13.2381 8.48752 12.8546 8.4875C12.8308 8.48749 12.8069 8.48749 12.7823 8.48749C12.6611 8.48748 12.54 8.48748 12.4188 8.48747C11.5609 8.48742 10.703 8.48728 9.84507 8.48707C9.01176 8.48687 8.17844 8.48672 7.34512 8.48663C7.31943 8.48662 7.29373 8.48662 7.26726 8.48662C7.00919 8.48659 6.75113 8.48656 6.49307 8.48654C5.96739 8.48648 5.44171 8.48642 4.91603 8.48635C4.89187 8.48635 4.8677 8.48635 4.8428 8.48634C3.22947 8.48615 1.61615 8.4858 0.00282882 8.48543C0.00194378 8.36775 0.00130956 8.25007 0.000889339 8.13239C0.000713815 8.09251 0.000474452 8.05263 0.000165268 8.01275C-0.00546745 7.26655 0.132939 6.48511 0.406569 5.78877C0.429531 5.7298 0.444643 5.67324 0.456644 5.61113C0.482527 5.48734 0.533482 5.37644 0.585396 5.26162C0.595824 5.2383 0.606251 5.21498 0.616995 5.19095C0.979317 4.38646 0.979317 4.38646 1.17611 4.09649C1.2069 4.05078 1.23769 4.00506 1.26845 3.95934C1.28293 3.93794 1.29741 3.91654 1.31233 3.89449C1.34338 3.846 1.36852 3.79982 1.39203 3.74749C1.43807 3.65003 1.50646 3.57376 1.57569 3.49186C1.63973 3.41531 1.69824 3.33494 1.75732 3.25455C1.91825 3.03711 2.09241 2.83158 2.28421 2.64075C2.30757 2.61383 2.33068 2.58669 2.35347 2.55927C2.4305 2.4701 2.51588 2.39309 2.60418 2.31526C2.63977 2.28365 2.67423 2.25073 2.7079 2.21707C2.86803 2.05693 3.04144 1.91563 3.22231 1.77978C3.26464 1.7479 3.30675 1.71574 3.34886 1.68356C3.51109 1.56003 3.67463 1.44378 3.84859 1.3371C3.8839 1.31403 3.91921 1.29094 3.95451 1.26785C4.26871 1.06896 4.59007 0.896722 4.9315 0.7497C4.97669 0.729508 5.02068 0.707824 5.06473 0.685281C5.16141 0.636215 5.26076 0.595219 5.36136 0.554917C5.37875 0.547747 5.39615 0.540577 5.41407 0.533189C5.54484 0.480632 5.67735 0.440416 5.81311 0.402729C5.88747 0.38207 5.96145 0.360424 6.03542 0.338406C6.81615 0.10823 7.58071 -0.00252759 8.39236 0.00110456Z" />
          {/* Middle stem & lower blocks */}
          <path d="M8.41145 10.5713C11.2078 10.5713 14.0041 10.5713 16.8852 10.5713C16.8852 13.3676 16.8852 16.1639 16.8852 19.045C14.1032 19.045 11.3212 19.045 8.4549 19.045C8.4549 21.827 8.4549 24.609 8.4549 27.4752C7.25982 27.4752 6.0987 27.2558 5.00834 26.7597C4.95575 26.736 4.90289 26.7131 4.84993 26.6903C4.53605 26.5543 4.24053 26.3937 3.95827 26.2C3.916 26.173 3.87404 26.1514 3.82832 26.1309C3.73855 26.0875 3.66766 26.029 3.59118 25.9656C3.52178 25.909 3.4493 25.8569 3.37675 25.8044C3.16943 25.6542 2.97369 25.496 2.78404 25.3242C2.77167 25.3131 2.7593 25.3019 2.74655 25.2904C2.39675 24.9745 2.39675 24.9745 2.26258 24.8245C2.26258 24.8102 2.26258 24.7958 2.26258 24.781C2.24824 24.781 2.2339 24.781 2.21913 24.781C2.19078 24.7537 2.19078 24.7537 2.15666 24.7131C2.13645 24.6893 2.13645 24.6893 2.11584 24.6649C2.09973 24.6459 2.08363 24.6268 2.06704 24.6072C2.04696 24.5843 2.02684 24.5615 2.00669 24.5386C1.88479 24.3998 1.77084 24.2586 1.66536 24.1068C1.61303 24.0317 1.5583 23.9603 1.49941 23.8902C1.42929 23.8043 1.37238 23.7146 1.31744 23.6186C1.30982 23.6053 1.3022 23.592 1.29434 23.5783C1.24139 23.4832 1.24139 23.4832 1.24139 23.4339C1.22705 23.4339 1.21271 23.4339 1.19794 23.4339C1.03543 23.1557 0.884128 22.8786 0.758552 22.5818C0.736992 22.5324 0.712539 22.4848 0.687344 22.4372C0.547441 22.1626 0.446655 21.8701 0.365156 21.5736C0.34887 21.5159 0.331503 21.4586 0.313989 21.4013C0.0681327 20.5918 0.00292969 19.8575 0.00292969 19.0015C2.77774 19.0015 5.55255 19.0015 8.41145 19.0015C8.41145 16.2196 8.41145 13.4376 8.41145 10.5713Z" />
        </g>
      </svg>
    </div>
  );
};

const CornerFlourish: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M1 10V4a3 3 0 0 1 3-3h6"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <path d="M5 5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Certificate of Completion for the Semantic SEO masterclass.
 *
 * Pure presentational, server-renderable. All personalised data arrives via
 * props so the same component backs the on-screen preview, print-to-PDF, and
 * (later) an emailed keepsake. Real text — not an image — so it stays
 * accessible and selectable.
 */
export const Certificate: React.FC<CertificateProps> = ({
  recipientName,
  credentialId,
  issueDate,
}) => {
  return (
    <div className="cert-stage">
      <article
        className="cert"
        aria-label={`Certificate of completion awarded to ${recipientName} for the Semantic SEO masterclass by Fynix Digital`}
      >
        {/* Right navy spine: Pavel on stage, blended into the deep-navy field */}
        <aside className="cert__spine">
          <div className="cert__spine-photo" aria-hidden="true" />
          <Logo className="cert__spine-logo" role="img" aria-label="Fynix Digital" />
        </aside>

        {/* Ornamental frame + corners on the cream field */}
        <div className="cert__frame" aria-hidden="true" />
        <CornerFlourish className="cert__corner cert__corner--tl" />
        <CornerFlourish className="cert__corner cert__corner--tr" />
        <CornerFlourish className="cert__corner cert__corner--bl" />
        <CornerFlourish className="cert__corner cert__corner--br" />

        {/* Body */}
        <div className="cert__body">
          <p className="cert__eyebrow">Certificate of Completion</p>

          <p className="cert__lead">Presented to</p>
          <h2 className="cert__name">{recipientName}</h2>

          <p className="cert__desc">
            for successfully completing the {WORKSHOP.format.toLowerCase()},
            <span className="cert__program">
              Semantic SEO: From Confusion to Clarity
            </span>
          </p>

          <p className="cert__blurb">
            Attended the full live session and gained a working understanding of
            entity-based search: how topical maps and semantic content networks
            come together, and how Google reads meaning across the web. Taught
            live by Pavel Klimakov.
          </p>

          <div className="cert__footer">
            <div className="cert__sign">
              <div className="cert__sign-name">Pavel Klimakov</div>
              <div className="cert__sign-rule" />
              <div className="cert__sign-label">Pavel Klimakov</div>
              <div className="cert__sign-sub">Workshop Instructor</div>
            </div>

            {/* Stamp seal perfectly centered in the footer */}
            <Seal className="cert__seal" />

            <dl className="cert__cred">
              <dt>Credential ID</dt>
              <dd>{credentialId}</dd>
              <dt>Date of Completion</dt>
              <dd>{issueDate}</dd>
            </dl>
          </div>
        </div>
      </article>
    </div>
  );
};

