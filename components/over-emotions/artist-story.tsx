"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { getText, story } from "@/data/presskit";
import { SectionHeader, CornerTicks } from "@/components/ui/tech-frame";
import { Reveal } from "@/components/ui/reveal";
import { useLocale } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";

export function ArtistStory() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();

  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="relative isolate overflow-clip border-b border-border py-24 md:py-32"
    >
      <div className="gutter mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader
            id="story-title"
            number="02"
            title={locale === "en" ? "THE JOURNEY" : "EL VIAJE"}
            kicker={locale === "en" ? "THE ARTIST / 2010 — TODAY" : "EL ARTISTA / 2010 — HOY"}
          />
        </Reveal>

        {/* Contenedor de las tarjetas */}
        <div className="mt-12 flex flex-col gap-6 md:mt-20 md:gap-12 pb-24">
          {story.map((block, i) => (
            <article
              key={block.id}
              className={cn(
                "sticky z-10 flex w-full flex-col overflow-hidden",
                "border border-border bg-void shadow-2xl md:flex-row",
                // Hacemos que la tarjeta tenga una altura base, pero NUNCA rebase la pantalla del dispositivo
                "h-[75vh] max-h-[calc(100dvh-7rem)] md:h-[70vh] md:max-h-[calc(100dvh-8rem)]"
              )}
              style={{
                // Este cálculo crea el efecto de "deck de tarjetas".
                // 6rem (96px) da espacio al header, y cada tarjeta baja 12px respecto a la anterior.
                top: `calc(6rem + ${i * 12}px)`,
              }}
            >
              {/* Palabra gigante de fondo que flota lentamente (drift effect) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.03]"
              >
                <motion.span 
                  className="font-display text-[20vw] leading-none whitespace-nowrap text-bone uppercase select-none"
                  animate={reduced ? {} : { x: ["-2%", "2%"] }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                >
                  {getText(block.keyword, locale)}
                </motion.span>
              </div>

              {/* ================================= THE VISUAL === */}
              {/* En móvil la imagen ocupa menos (28vh en lugar de 45vh) */}
              <div className="relative z-10 h-[28vh] sm:h-[35vh] w-full shrink-0 border-b border-border md:h-auto md:w-5/12 md:border-b-0 md:border-r lg:w-1/2">
                <Image
                  src={block.image}
                  alt={block.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    "object-cover saturate-[0.8] contrast-[1.1]",
                    // i === 2 corresponde a la TERCERA imagen (0, 1, 2)
                    i === 2 ? "object-[center_25%]" : "object-center"
                  )}
                  priority={i === 0}
                />
                <div className="grain-layer" />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-void/30" />
                <CornerTicks size={18} color="border-acid/60" />

                <div className="absolute bottom-3 left-4 flex items-center gap-3 md:bottom-4">
                  <span className="label text-label-xs tabular-nums text-acid">
                    {block.index}
                  </span>
                  <span className="h-px w-10 bg-border-strong" />
                  <span className="label text-label-xs text-bone-dim">
                    {getText(block.keyword, locale)}
                  </span>
                </div>
              </div>

              {/* ================================== THE TEXT ==== */}
              {/* Agregado overflow-y-auto por si el texto es muy largo en pantallas muy pequeñas */}
              <div className="relative z-10 flex flex-1 flex-col justify-center overflow-y-auto bg-void/80 backdrop-blur-sm p-5 sm:p-8 md:p-12 lg:p-16">
                <Reveal kind="fade-up">
                  <div className="mb-4 flex items-center gap-3 md:mb-8">
                    <span className="label text-label-xs tabular-nums text-acid">
                      {block.index}
                    </span>
                    <span aria-hidden="true" className="h-px w-16 bg-acid" />
                  </div>
                </Reveal>

                <Reveal kind="fade-up">
                  <h3 className="font-display text-4xl leading-[0.95] text-bone uppercase sm:text-5xl lg:text-6xl mb-3 md:mb-6">
                    {getText(block.heading, locale)}
                  </h3>
                </Reveal>

                <Reveal kind="fade-up" delay={0.08}>
                  <p className="max-w-prose text-body-md text-bone-dim md:text-body-lg">
                    {getText(block.body, locale)}
                  </p>
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArtistStory;