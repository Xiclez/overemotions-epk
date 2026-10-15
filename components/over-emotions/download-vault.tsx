"use client";

import {
  Coffee,
  Download,
  FileText,
  FileType,
  Image as ImageIcon,
  Lock,
  Package,
  Shapes,
  Video,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getText, vault, type VaultAsset, type VaultIcon } from "@/data/presskit";
import { SectionHeader } from "@/components/ui/tech-frame";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { useLocale } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";

const ICONS: Record<VaultIcon, LucideIcon> = {
  document: FileText,
  text: FileType,
  image: ImageIcon,
  package: Package,
  logo: Shapes,
  wrench: Wrench,
  coffee: Coffee,
  video: Video,
};

export function DownloadVault() {
  const { locale } = useLocale();
  const available = vault.filter((v) => v.href).length;

  return (
    <section
      id="vault"
      aria-labelledby="vault-title"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="hatch pointer-events-none absolute inset-0 -z-10 opacity-40"
      />

      <div className="gutter mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeader
              id="vault-title"
              number="08"
              title={locale === "en" ? "DOWNLOAD VAULT" : "ARCHIVO DE DESCARGAS"}
              kicker={locale === "en" ? "PRESS MATERIAL" : "MATERIAL DE PRENSA"}
            />
          </Reveal>
    {/*
          <Reveal delay={0.05}>
            <div className="flex items-center gap-6 border border-border bg-charcoal/60 px-5 py-4 overflow-x-auto no-scrollbar">
              <div className="flex flex-col gap-1 shrink-0">
                <span className="label text-label-xs text-gray">{locale === "en" ? "SLOTS" : "ESPACIOS"}</span>
                <span className="label text-label-md text-bone tabular-nums">
                  {String(vault.length).padStart(2, "0")}
                </span>
              </div>
              <span aria-hidden="true" className="h-8 w-px bg-border shrink-0" />
              <div className="flex flex-col gap-1 shrink-0">
                <span className="label text-label-xs text-gray">{locale === "en" ? "AVAILABLE" : "DISPONIBLES"}</span>
                <span
                  className={cn(
                    "label text-label-md tabular-nums",
                    available > 0 ? "text-acid" : "text-ultra",
                  )}
                >
                  {String(available).padStart(2, "0")}
                </span>
              </div>
              <span aria-hidden="true" className="h-8 w-px bg-border shrink-0" />
              <div className="flex flex-col gap-1 shrink-0">
                
                <span className="label text-label-xs text-gray">{locale === "en" ? "STATUS" : "ESTADO"}</span>
                <span className="label flex items-center gap-1.5 text-label-md text-bone">
                  <Lock className="size-3.5 text-acid" aria-hidden="true" />
                  {locale === "en" ? "PENDING" : "PENDIENTE"}
                </span>
                
              </div>
            </div>
            
          </Reveal>
          */}
        </div>

        {/* La tabla se expande hacia abajo de forma fluida */}
        <RevealGroup
          stagger={0.04}
          className="mt-12 grid gap-px border border-border bg-border md:mt-16 md:grid-cols-2"
        >
          {vault.map((asset, i) => (
            <RevealItem key={asset.id}>
              <VaultRow asset={asset} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.05}>
          <div className="mt-8 flex flex-col gap-4 border border-border bg-charcoal/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-bone-dim">
              {locale === "en"
                ? "Need everything at once? The press kit PDF bundles bio, vision, genres, sets, rider and links in a single file."
                : "¿Todo a la vez? El PDF del press kit reúne bio, visión, géneros, sets, rider y enlaces en un solo archivo."}
            </p>
            {/* Usamos asChild para que el Button de tu UI actúe como una etiqueta <a> */}
            <Button variant="outline" className="shrink-0" asChild>
              <a href="/media/docs/Over_Emotions_Press_Kit.pdf" download="Over_Emotions_Press_Kit.pdf">
                <Download className="size-4" aria-hidden="true" />
                {locale === "en" ? "DOWNLOAD PRESS KIT" : "DESCARGAR PRESS KIT"}
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- ROW --- */

function VaultRow({ asset, index }: { asset: VaultAsset; index: number }) {
  const { locale } = useLocale();
  const Icon = ICONS[asset.icon];
  const pending = !asset.href;

  const body = (
    <>
      <span className="label hidden w-8 shrink-0 text-label-xs text-border-strong tabular-nums sm:block">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center border",
          pending
            ? "border-border text-gray"
            : "border-acid/60 text-acid",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1 py-2 pr-2">
        <span
          className={cn(
            "label text-label-sm leading-tight",
            pending
              ? "text-bone-dim"
              : "text-bone transition-colors group-hover:text-acid",
          )}
        >
          {asset.name}
        </span>
        <span className="text-body-sm text-gray leading-tight">
          {getText(asset.description, locale)}
        </span>
      </span>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="label border border-border px-2 py-1 text-label-xs text-gray">
          {asset.format}
        </span>

        <span
          className={cn(
            "label w-auto text-right text-label-xs sm:w-28",
            pending ? "text-gray" : "text-acid",
          )}
        >
          {pending ? (locale === "en" ? "ASSET PENDING" : "ACTIVO PENDIENTE") : (asset.size ?? (locale === "en" ? "DOWNLOAD" : "DESCARGA"))}
        </span>
      </div>
    </>
  );

  if (pending) {
    return (
      <div
        className="flex min-h-20 items-center gap-3 bg-void px-4 py-4 opacity-70 sm:gap-4"
        aria-label={`${asset.name} — asset pending`}
      >
        {body}
      </div>
    );
  }

  return (
    <a
      href={asset.href ?? undefined}
      download
      className={cn(
        "group flex min-h-20 items-center gap-3 bg-void px-4 py-4 sm:gap-4",
        "transition-colors duration-[var(--duration-fast)] hover:bg-charcoal",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acid",
      )}
    >
      {body}
      <Download
        className="size-4 shrink-0 text-acid transition-transform duration-[var(--duration-normal)] group-hover:translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

export default DownloadVault;