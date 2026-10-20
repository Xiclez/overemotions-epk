"use client";

/**
 * ============================================================================
 * TRACK RECORD
 * ============================================================================
 * Everything here comes from the artist's own press kit PDF: the milestones,
 * the debut EP and the line-ups he has shared. The shared-stage names are the
 * strongest proof a promoter can scan, so they get display type, not chips.
 */

import * as React from "react";
import { Disc3 } from "lucide-react";
import { artist, credibility, getText } from "@/data/presskit";
import { SectionHeader } from "@/components/ui/tech-frame";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Marquee, MarqueeItem } from "@/components/ui/marquee";
import { useLocale } from "@/components/over-emotions/frequency-provider";

export function CredibilitySection() {
  const { locale } = useLocale();
  const r = credibility.release;

  return (
    <section
      id="credibility"
      aria-labelledby="credibility-title"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div className="gutter mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader
            id="credibility-title"
            number="03"
            title={locale === "en" ? "TRACK RECORD" : "TRAYECTORIA"}
            kicker={locale === "en" ? "MILESTONES / RELEASES / STAGES" : "HITOS / LANZAMIENTOS / ESCENARIOS"}
          />
        </Reveal>

        {/* ------------------------------------------------------ milestones */}
        <RevealGroup
          stagger={0.05}
          className="mt-12 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4"
        >
          {credibility.stats.map((stat, index) => (
            <RevealItem key={`${getText(stat.label, locale)}-${index}`}>
              <div className="@container flex h-full flex-col justify-between gap-6 bg-void p-5 md:p-6">
                <span className="label text-label-xs text-gray">
                  {getText(stat.label, locale)}
                </span>
                <StatValue value={getText(stat.value, locale)} />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-16">
          {/* -------------------------------------------- shared stage wall */}
          <Reveal className="flex flex-col gap-6">
            <h3 className="label text-label-sm text-acid">
              {locale === "en" ? "SHARED THE STAGE WITH" : "HA COMPARTIDO ESCENARIO CON"}
            </h3>
            <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              {credibility.sharedStage.map((name, i) => (
                <li
                  key={name}
                  className="font-display text-[clamp(1.1rem,2.6vw,2rem)] leading-tight text-bone"
                >
                  {name}
                  {i < credibility.sharedStage.length - 1 && (
                    <span aria-hidden="true" className="ml-4 text-ultra">
                      /
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="label text-label-xs text-gray">
              {locale === "en"
                ? "FESTIVALS AND CLUBS ACROSS MEXICO — AMONG OTHERS"
                : "FESTIVALES Y CLUBS DE TODO MÉXICO — ENTRE OTROS"}
            </p>
          </Reveal>

          <div className="flex flex-col gap-8">
            {/* ------------------------------------------------ debut EP card */}
            <Reveal>
              <article className="flex flex-col gap-4 border border-border bg-charcoal/60 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="label text-label-xs text-gray">
                    {locale === "en" ? "DEBUT" : "DEBUT"} {getText(r.type, locale)} / {r.year}
                  </span>
                  <Disc3 className="size-5 text-acid" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl leading-tight text-bone">{r.title}</h3>
                <p className="text-body-sm text-bone-dim">
                  {r.label} — {getText(r.labelOrigin, locale)}.{" "}
                  {locale === "en"
                    ? "The release that put Over Emotions on the international psytrance map."
                    : "El lanzamiento que colocó a Over Emotions en el mapa internacional del psytrance."}
                </p>
              </article>
            </Reveal>

            {/* ------------------------------------------------- influences */}
            <Reveal className="flex flex-col gap-3">
              <h3 className="label text-label-sm text-acid">
                {locale === "en" ? "INFLUENCES" : "INFLUENCIAS"}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {credibility.influences.map((name) => (
                  <li
                    key={name}
                    className="label border border-border px-3 py-2 text-label-xs text-bone-dim"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- name marquee */}
      <div className="mt-16 border-y border-border py-3">
        <Marquee speed="slow" direction="right">
          {credibility.sharedStage.map((name) => (
            <MarqueeItem key={name}>{name}</MarqueeItem>
          ))}
          <MarqueeItem>{artist.name}</MarqueeItem>
        </Marquee>
      </div>
    </section>
  );
}

export default CredibilitySection;

/**
 * Long words (INDEPENDIENTE) must never clip. The size is capped so the word fits
 * the card on one line from md up; below md it may break at its soft hyphen
 * (­) so each half stays as large as the years beside it.
 */
function StatValue({ value }: { value: string }) {
  const SIZE = "clamp(1.25rem, 3.4vw, 2.4rem)";
  const EM_PER_CHAR = 0.95; // Climate Crisis caps run ~0.9em wide
  const full = value.replace(/­/g, "").length;
  const parts = value.split("­");
  const segment = Math.max(...parts.map((p) => p.length)) + (parts.length > 1 ? 1 : 0);

  return (
    <span
      className="font-display leading-[1.05] text-bone hyphens-manual text-(length:--fit-segment) md:text-(length:--fit-full)"
      style={
        {
          "--fit-full": `min(${SIZE}, calc(100cqw / ${full * EM_PER_CHAR}))`,
          "--fit-segment": `min(${SIZE}, calc(100cqw / ${segment * EM_PER_CHAR}))`,
        } as React.CSSProperties
      }
    >
      {value}
    </span>
  );
}
