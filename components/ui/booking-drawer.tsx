"use client";

/**
 * ============================================================================
 * BOOKING DOSSIER — the persistent conversion shortcut
 * ============================================================================
 * A booker who will not scroll past the hero still needs the whole picture. This
 * drawer is that picture, reachable from every scroll position: short bio,
 * genres, formats, music links, press photos, tech rider, contact, and
 * a book button.
 *
 * It is a panel of DIRECT INFORMATION, not a teaser. Nothing here is hidden
 * behind a hover, and every row is readable on a 320px screen.
 *
 * Opens from the right on desktop and from the bottom on mobile (thumb zone).
 * vaul supplies Escape, focus trap, scroll lock and drag-to-dismiss.
 */

import * as React from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Download,
  FileWarning,
  AtSign,
  Mail,
} from "lucide-react";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DataRow } from "@/components/ui/tech-frame";
import { cn } from "@/lib/utils";
import {
  artist,
  bio,
  contact,
  dossier,
  formats,
  getText,
  music,
  vault,
} from "@/data/presskit";
import { useDossier, useLocale } from "@/components/over-emotions/frequency-provider";

export function BookingDrawerTrigger({
  className,
  variant = "primary",
  size = "default",
  label,
}: {
  className?: string;
  variant?: "primary" | "outline" | "ultra" | "plate" | "ghost";
  size?: "sm" | "default" | "lg";
  label?: string;
}) {
  const { setDossierOpen } = useDossier();
  const { locale } = useLocale();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => setDossierOpen(true)}
    >
      {label ?? getText(dossier.triggerLabel, locale)}
    </Button>
  );
}

/**
 * The drawer itself. Mounted once, near the root, and driven by context so any
 * button anywhere can open it without prop drilling.
 */
export function BookingDrawer() {
  const { dossierOpen, setDossierOpen } = useDossier();
  const { locale } = useLocale();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const side = isMobile ? "bottom" : "right";
  const topReleases = music.filter((t) => t.category === "releases").slice(0, 3);
  const riderAsset = vault.find((v) => v.id === "tech-rider");
  const pressPhotos = vault.find((v) => v.id === "press-photos");

  return (
    <Drawer
      open={dossierOpen}
      onOpenChange={setDossierOpen}
      direction={side}
      // Prevents the iOS background-shrink effect; keeps the page still.
      shouldScaleBackground={false}
    >
      <DrawerContent side={side} className="gutter">
        {/* --------------------------------------------------------- header */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border py-5">
          <div className="flex flex-col gap-2">
            <span className="label text-label-xs text-acid">
              {artist.name} / {getText(artist.role, locale)}
            </span>
            <DrawerTitle className="font-display text-3xl text-bone uppercase">
              {getText(dossier.title, locale)}
            </DrawerTitle>
            <DrawerDescription className="label text-label-xs text-gray">
              {getText(dossier.subtitle, locale)}
            </DrawerDescription>
          </div>
          <DrawerCloseButton className="mt-1" />
        </header>

        {/* ------------------------------------------------------- scroll body */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-8">
            {/* BIO ---------------------------------------------------------- */}
            <DossierBlock title={getText(dossier.sections.bio, locale)}>              <p className="text-body-sm text-bone-dim">{getText(bio.short, locale)}</p>
            </DossierBlock>

            {/* GENRES ------------------------------------------------------- */}
            <DossierBlock title={getText(dossier.sections.genres, locale)}>              <ul className="flex flex-wrap gap-2">
              {dossier.genres.map((genre, i) => (
                <li key={genre}>
                  <span
                    className={cn(
                      "label border px-2.5 py-1 text-label-xs",
                      // The first two carry the core positioning
                      i < 2
                        ? "border-acid bg-acid/10 text-acid"
                        : "border-border text-bone-dim",
                    )}
                  >
                    {genre}
                  </span>
                </li>
              ))}
            </ul>
            </DossierBlock>

            {/* FORMATS ------------------------------------------------------ */}
            <DossierBlock title={getText(dossier.sections.formats, locale)}>              <ul className="flex flex-col gap-3">
              {formats.map((format) => (
                <li
                  key={format.id}
                  className="border border-border bg-void/50 p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="label text-label-sm text-bone">
                      {getText(format.name, locale)}
                    </span>
                    <span className="label shrink-0 text-label-xs text-acid">
                      {format.duration}
                    </span>
                  </div>
                  <p className="mt-2 text-body-sm text-bone-dim">
                    {getText(format.tagline, locale)}
                  </p>
                </li>
              ))}
            </ul>
            </DossierBlock>



            {/* MUSIC -------------------------------------------------------- */}
            <DossierBlock title={getText(dossier.sections.music, locale)}>              <ul className="flex flex-col">
              {topReleases.map((track) => (
                <li
                  key={track.id}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <Image
                    src={track.artwork}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="label truncate text-label-xs text-bone">
                      {track.title}
                    </p>
                    <p className="label text-label-xs text-gray">
                      {track.genre} / {track.type}
                    </p>
                  </div>
                  {track.externalUrl ? (
                    <a
                      href={track.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label flex min-h-11 items-center gap-1 px-2 text-label-xs text-acid hover:underline"
                    >
                      {track.externalLabel}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="label px-2 text-label-xs text-gray">
                      {locale === "en" ? "LINK PENDING" : "LINK PENDIENTE"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
              <a
                href="#music"
                onClick={() => setDossierOpen(false)}
                className="label mt-3 inline-flex min-h-11 items-center text-label-xs text-acid hover:underline"
              >
                {locale === "en" ? "FULL MUSIC LAB" : "LAB DE MÚSICA COMPLETO"}
              </a>
            </DossierBlock>

            {/* PRESS PHOTOS ------------------------------------------------- */}
            <DossierBlock title={getText(dossier.sections.photos, locale)}>              <div className="grid grid-cols-3 gap-2">
              {["/placeholders/portrait.svg", "/placeholders/live-04.svg", "/placeholders/live-01.svg"].map(
                (src) => (
                  <div
                    key={src}
                    className="relative aspect-square border border-border"
                  >
                    <Image
                      src={src}
                      alt="Placeholder press photo"
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>
                ),
              )}
            </div>
              <AssetLink asset={pressPhotos} />
            </DossierBlock>

            {/* RIDER -------------------------------------------------------- */}
            <DossierBlock title={getText(dossier.sections.rider, locale)}>              <p className="text-body-sm text-bone-dim">{getText(dossier.riderNote, locale)}</p>
              <AssetLink asset={riderAsset} />
            </DossierBlock>

            {/* CONTACT ------------------------------------------------------ */}
            <DossierBlock title={getText(dossier.sections.contact, locale)}>              <div className="flex flex-col">
              <DataRow label="BOOKING">
                <a
                  href={`mailto:${contact.bookingEmail}`}
                  className="break-all text-acid hover:underline"
                >
                  {contact.bookingEmail}
                </a>
              </DataRow>
              <DataRow label="INSTAGRAM">
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-acid hover:underline"
                >
                  {contact.instagramHandle}
                </a>
              </DataRow>
              <DataRow label="TERRITORY">{contact.territory}</DataRow>
            </div>
            </DossierBlock>
          </div>
        </div>

        {/* ------------------------------------------------------ sticky footer */}
        <footer className="shrink-0 border-t border-border bg-charcoal py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="primary"
              className="flex-1"
              asChild
              onClick={() => setDossierOpen(false)}
            >
              <a href="#booking">
                <Mail className="size-4" aria-hidden="true" />
                {getText(dossier.bookCta, locale)}
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram profile"
              >
                <AtSign className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="label mt-3 text-label-xs text-gray">
            {contact.bookingEmail}
          </p>
        </footer>
      </DrawerContent>
    </Drawer>
  );
}

/* ---------------------------------------------------------------- pieces --- */

function DossierBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h3 className="label text-label-xs text-acid">{title}</h3>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

/** Download row that degrades to a clear, non-clickable pending state. */
function AssetLink({
  asset,
}: {
  asset: { name: string; href: string | null; format: string } | undefined;
}) {
  if (!asset) return null;
  if (!asset.href) {
    return (
      <p className="label mt-3 inline-flex items-center gap-2 text-label-xs text-gray">
        <FileWarning className="size-3.5" aria-hidden="true" />
        {asset.name} — ASSET PENDING
      </p>
    );
  }
  return (
    <a
      href={asset.href}
      download
      className="label mt-3 inline-flex min-h-11 items-center gap-2 text-label-xs text-acid hover:underline"
    >
      <Download className="size-3.5" aria-hidden="true" />
      DOWNLOAD {asset.format}
    </a>
  );
}

export default BookingDrawer;
