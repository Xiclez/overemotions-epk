"use client";

/**
 * ============================================================================
 * FREQUENCY PROVIDER — the only global state in the build
 * ============================================================================
 *   mode     which musical frequency is active (drives shader, 3D light, accents)
 *   sound    whether the visitor opted into audio. Starts false, ALWAYS.
 *   quality  HIGH / MEDIUM / LOW render tier
 *   dossier  whether the Booking Dossier drawer is open
 *
 * Consumers use the narrow hooks (useMode, useQuality, useSound, useDossier) so
 * a component that only needs the quality tier does not re-render on mode change
 * — mode and quality live in separate contexts for exactly that reason.
 */

import * as React from "react";
import {
  defaultModeId,
  getMode,
  modes,
  type Locale,
  type ModeId,
  type MusicalMode,
} from "@/data/presskit";
import { detectQualityTier, type QualityTier } from "@/lib/webgl";

/* ------------------------------------------------------------- CONTEXTS --- */

interface ModeContextValue {
  modeId: ModeId;
  mode: MusicalMode;
  setModeId: (id: ModeId) => void;
  /** Index in the modes array — used by the dial for rotation maths. */
  modeIndex: number;
}

interface SoundContextValue {
  soundEnabled: boolean;
  setSoundEnabled: (on: boolean) => void;
  toggleSound: () => void;
}

interface DossierContextValue {
  dossierOpen: boolean;
  setDossierOpen: (open: boolean) => void;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const ModeContext = React.createContext<ModeContextValue | null>(null);
const SoundContext = React.createContext<SoundContextValue | null>(null);
const QualityContext = React.createContext<QualityTier>("high");
const DossierContext = React.createContext<DossierContextValue | null>(null);
const LocaleContext = React.createContext<LocaleContextValue | null>(null);

/* -------------------------------------------------- quality tier store --- */
/** The tier never changes after load, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};
const getServerQuality = (): QualityTier => "medium";

/* ------------------------------------------------------------- PROVIDER --- */

export function FrequencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modeId, setModeId] = React.useState<ModeId>(defaultModeId);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [dossierOpen, setDossierOpen] = React.useState(false);
  const [locale, setLocale] = React.useState<Locale>("es");

  /**
   * The quality tier is a read of the client environment (WebGL support, cores,
   * pointer type, reduced-motion, localStorage override). useSyncExternalStore is
   * the right tool: the server snapshot is the conservative "medium" tier, the
   * client snapshot is the real detection, and React handles the handover without
   * a setState-in-effect cascade or a hydration mismatch.
   */
  const quality = React.useSyncExternalStore(
    subscribeToNothing,
    detectQualityTier,
    getServerQuality,
  );

  const modeValue = React.useMemo<ModeContextValue>(() => {
    const mode = getMode(modeId);
    return {
      modeId,
      mode,
      setModeId,
      modeIndex: modes.findIndex((m) => m.id === modeId),
    };
  }, [modeId]);

  const soundValue = React.useMemo<SoundContextValue>(
    () => ({
      soundEnabled,
      setSoundEnabled,
      toggleSound: () => setSoundEnabled((s) => !s),
    }),
    [soundEnabled],
  );

  const dossierValue = React.useMemo<DossierContextValue>(
    () => ({ dossierOpen, setDossierOpen }),
    [dossierOpen],
  );

  const localeValue = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale((current) => (current === "en" ? "es" : "en")),
    }),
    [locale],
  );

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <QualityContext.Provider value={quality}>
      <SoundContext.Provider value={soundValue}>
        <DossierContext.Provider value={dossierValue}>
          <LocaleContext.Provider value={localeValue}>
            <ModeContext.Provider value={modeValue}>
              {children}
            </ModeContext.Provider>
          </LocaleContext.Provider>
        </DossierContext.Provider>
      </SoundContext.Provider>
    </QualityContext.Provider>
  );
}

/* ---------------------------------------------------------------- HOOKS --- */

export function useMode() {
  const ctx = React.useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside <FrequencyProvider>");
  return ctx;
}

export function useSound() {
  const ctx = React.useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside <FrequencyProvider>");
  return ctx;
}

export function useQuality() {
  return React.useContext(QualityContext);
}

export function useDossier() {
  const ctx = React.useContext(DossierContext);
  if (!ctx)
    throw new Error("useDossier must be used inside <FrequencyProvider>");
  return ctx;
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <FrequencyProvider>");
  return ctx;
}
