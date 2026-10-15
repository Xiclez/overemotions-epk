"use client";

/**
 * SiteFooter — contact, socials, mockup disclaimer, style guide link.
 * Links with `href: null` render as clearly non-clickable "PENDING" chips rather
 * than as dead anchors.
 */

import Image from "next/image";
import Link from "next/link";
import { artist, contact, footer, getText, sections } from "@/data/presskit";
import { Marquee, MarqueeItem } from "@/components/ui/marquee";
import { useLocale } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const { locale } = useLocale();
  return (
    <footer className="relative">
      {/* Oversized wordmark, cropped by the viewport edge — editorial sign-off */}
      <div className="overflow-hidden border-b border-border">
        <Marquee speed="slow">
          <MarqueeItem separator="/">{artist.name}</MarqueeItem>
          <MarqueeItem separator="/">{getText(artist.concept, locale)}</MarqueeItem>
          <MarqueeItem separator="/">{getText(artist.role, locale)}</MarqueeItem>
        </Marquee>
      </div>

      <div className="gutter mx-auto max-w-7xl py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {/* Identity */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Image
                src={artist.logos.retro.src}
                alt={artist.name}
                width={artist.logos.retro.width}
                height={artist.logos.retro.height}
                className="h-8 w-auto self-start"
              />
              <span className="label text-label-xs text-gray">
                {getText(artist.role, locale)} / {getText(artist.origin, locale)}
              </span>
            </div>
            <p className="max-w-xs text-body-sm text-bone-dim">
              {getText(footer.tagline, locale)}
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h2 className="label text-label-xs text-acid">{locale === "en" ? "CONTACT" : "CONTACTO"}</h2>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${contact.bookingEmail}`}
                  className="label flex min-h-11 items-center text-label-xs break-all text-bone-dim transition-colors hover:text-acid"
                >
                  {contact.bookingEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation + socials */}
          <div className="flex flex-col gap-8">
            {/*
            <div className="flex flex-col gap-4">
              <h2 className="label text-label-xs text-acid">{locale === "en" ? "SECTIONS" : "SECCIONES"}</h2>
              <ul className="grid grid-cols-2 gap-x-4">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="label flex min-h-11 items-center gap-2 text-label-xs text-bone-dim transition-colors hover:text-acid"
                    >
                      <span className="tabular-nums text-border-strong">
                        {section.number}
                      </span>
                      {getText(section.label, locale)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            */}

            <div className="flex flex-col gap-4">
              <h2 className="label text-label-xs text-acid">{locale === "en" ? "PLATFORMS" : "PLATAFORMAS"}</h2>
              <ul className="flex flex-wrap gap-2">
                {contact.socials.map((social) =>
                  social.href ? (
                    <li key={social.id}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "label flex min-h-11 items-center border border-border px-3 text-label-xs text-bone-dim",
                          "transition-colors hover:border-acid hover:text-acid",
                        )}
                      >
                        {social.label}
                      </a>
                    </li>
                  ) : (
                    <li
                      key={social.id}
                      className="label flex min-h-11 items-center border border-dashed border-border px-3 text-label-xs text-gray"
                    >
                      {social.label} — {locale === "en" ? "PENDING" : "PENDIENTE"}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Mockup disclaimer bar
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-label-xs text-acid">
            {getText(footer.mockupNotice, locale)}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/style-guide"
              className="label flex min-h-11 items-center text-label-xs text-bone-dim transition-colors hover:text-acid"
            >
              {getText(footer.styleGuideLabel, locale)}
            </Link>
            <span className="label text-label-xs text-gray">
              {getText(footer.credit, locale)}
            </span>
          </div>
        </div>
         */}
      </div>
    </footer>
  );
}

export default SiteFooter;
