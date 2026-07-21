import Link from "next/link";
import styles from "./HeroLandscape.module.css";

const tiles = Array.from({ length: 176 }, (_, index) => index);

function GrowthSurface({
  className,
  label,
  detail,
  glyph,
}: {
  className: string;
  label: string;
  detail: string;
  glyph: string;
}) {
  return (
    <div className={`${styles.surface} ${className}`} aria-hidden="true">
      <span className={styles.surfaceGlyph}>{glyph}</span>
      <span className={styles.surfaceLabel}>{label}</span>
      <span className={styles.surfaceDetail}>{detail}</span>
    </div>
  );
}

export default function HeroLandscape() {
  return (
    <section className={styles.hero} aria-labelledby="homepage-hero-heading">
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.horizonGlow} aria-hidden="true" />

      <div className={styles.scene} aria-hidden="true">
        <div className={styles.tilePlane}>
          <div className={styles.tiles}>
            {tiles.map((tile) => (
              <span key={tile} className={styles.tile} />
            ))}
          </div>
        </div>
        <div className={styles.stepsLeft} />
        <div className={styles.stepsRight} />
        <GrowthSurface
          className={styles.surfaceLeft}
          glyph="◎"
          label="UX"
          detail="Buyer clarity"
        />
        <GrowthSurface
          className={styles.surfaceRight}
          glyph="⌘"
          label="SEO / AEO"
          detail="Search visibility"
        />
        <GrowthSurface
          className={styles.surfaceFar}
          glyph="↗"
          label="BUILD"
          detail="Technical foundation"
        />
        <GrowthSurface
          className={styles.surfaceNear}
          glyph="◌"
          label="PIPELINE"
          detail="Qualified demand"
        />
      </div>

      <div className={styles.frame} aria-hidden="true">
        <span className={`${styles.tick} ${styles.tickTopLeft}`} />
        <span className={`${styles.tick} ${styles.tickTopRight}`} />
        <span className={`${styles.tick} ${styles.tickBottomLeft}`} />
        <span className={`${styles.tick} ${styles.tickBottomRight}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.announcement}>
          <span className={styles.announcementMark} aria-hidden="true">✦</span>
          <span><strong>Cybersecurity growth, connected.</strong> One system from first impression to pipeline.</span>
          <span className={styles.announcementArrow} aria-hidden="true">→</span>
        </div>

        <h1 id="homepage-hero-heading" className={styles.heading}>
          The website your
          <br />
          buyers <em>trust</em> first.
        </h1>

        <p className={styles.intro}>
          Fynix connects buyer clarity, technical performance, search visibility,
          and pipeline conversion for cybersecurity companies.
        </p>

        <div className={styles.actions}>
          <Link href="/contact" className={`${styles.primaryAction} cta-primary`}>
            Book a discovery call <span aria-hidden="true">→</span>
          </Link>
          <Link href="/case-studies" className={styles.secondaryAction}>
            View our work
          </Link>
        </div>

        <div className={styles.proof}>
          <div>
            <strong>40+</strong>
            <span>Cybersecurity engagements<br />since 2016</span>
          </div>
          <div>
            <strong>2.4×</strong>
            <span>Average pipeline lift<br />within six months</span>
          </div>
        </div>
      </div>
    </section>
  );
}
