"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Disc3, Pause, Play } from "lucide-react";
import { getText, music, musicTabs, type Track, type TrackCategory } from "@/data/presskit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/ui/tech-frame";
import { Reveal } from "@/components/ui/reveal";
import { useLocale, useMode, useSound } from "@/components/over-emotions/frequency-provider";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";

// Helper para formatear los segundos a MM:SS
const formatTime = (secs: number) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export function MusicLab() {
  const { locale } = useLocale();
  const [tab, setTab] = React.useState<TrackCategory>("releases");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const [audioProgress, setAudioProgress] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(0);

  const { mode } = useMode();
  const { soundEnabled } = useSound();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const activeTrack = music.find((t) => t.id === activeId) ?? null;

  const toggleTrack = React.useCallback(
    (track: Track) => {
      const isActive = activeId === track.id;

      if (isActive) {
        setActiveId(null);
        audioRef.current?.pause();
        return;
      }

      setActiveId(track.id);
      setAudioProgress(0);
      setAudioDuration(0);

      if (!track.audioSrc) return;

      // NUEVO: Si está muteado globalmente, mandamos señal al Navbar
      if (!soundEnabled) {
        window.dispatchEvent(new CustomEvent("prompt-unmute"));
      }

      // NUEVO: Apagamos los videos del LiveArchive
      window.dispatchEvent(new CustomEvent("force-pause-videos"));

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = "none";
        
        audioRef.current.addEventListener('timeupdate', () => {
          setAudioProgress(audioRef.current?.currentTime || 0);
        });
        audioRef.current.addEventListener('loadedmetadata', () => {
          setAudioDuration(audioRef.current?.duration || 0);
        });
        audioRef.current.addEventListener('ended', () => {
           setActiveId(null);
           setAudioProgress(0);
        });
      }
      
      const audio = audioRef.current;
      if (audio.src !== new URL(track.audioSrc, window.location.href).href) {
        audio.src = track.audioSrc;
      }
      
      audio.muted = !soundEnabled;
      void audio.play().catch(() => {});
    },
    [activeId, soundEnabled],
  );

  const handleSeek = React.useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioProgress(time);
    }
  }, []);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  // NUEVO: Escuchar si LiveArchive desmutea un video para detener la música
  React.useEffect(() => {
    const stopAudio = () => {
      setActiveId(null);
      audioRef.current?.pause();
    };
    window.addEventListener("force-pause-audio", stopAudio);
    return () => window.removeEventListener("force-pause-audio", stopAudio);
  }, []);

  React.useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <section
      id="music"
      aria-labelledby="music-title"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div className="gutter mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader
            id="music-title"
            number="05"
            title={locale === "en" ? "MUSIC LAB" : "LAB DE MÚSICA"}
            kicker={locale === "en" ? "RELEASES / DJ SETS" : "LANZAMIENTOS / SETS"}
          />
        </Reveal>

        <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-12">
          {/* ==================================================== TRACK LIST == */}
          <div className="min-w-0">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as TrackCategory)}
            >
              <div className="no-scrollbar overflow-x-auto pb-1">
                <TabsList aria-label="Music categories" className="w-max sm:w-auto">
                  {musicTabs.map((t) => (
                    <TabsTrigger key={t.id} value={t.id}>
                      {getText(t.label, locale)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {musicTabs.map((t) => {
                const tracks = music.filter((track) => track.category === t.id);
                return (
                  <TabsContent key={t.id} value={t.id} className="mt-0">
                    <ul>
                      {tracks.map((track, i) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          index={i}
                          active={activeId === track.id}
                          accent={mode.accent}
                          onToggle={() => toggleTrack(track)}
                        />
                      ))}
                    </ul>
                    {tracks.length === 0 && (
                      <p className="label py-10 text-label-xs text-gray">
                        {locale === "en" ? "NO ENTRIES — ADD TRACKS IN data/presskit.ts" : "SIN ENTRADAS — AÑADE TRACKS EN data/presskit.ts"}
                      </p>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          {/* ================================================== NOW SHOWING == */}
          <div className="order-first self-start md:order-last md:sticky md:top-28">
            <NowShowing
              track={activeTrack}
              accent={mode.accent}
              audible={Boolean(activeTrack?.audioSrc && soundEnabled)}
              progress={audioProgress}
              duration={audioDuration}
              onSeek={handleSeek}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- TRACK ROW --- */

function TrackRow({
  track,
  index,
  active,
  accent,
  onToggle,
}: {
  track: Track;
  index: number;
  active: boolean;
  accent: string;
  onToggle: () => void;
}) {
  const { locale } = useLocale();

  return (
    <li
      className={cn(
        "group relative border-b border-border transition-colors duration-[var(--duration-fast)]",
        active ? "bg-charcoal" : "hover:bg-charcoal/50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-[2px] transition-transform duration-[var(--duration-normal)]",
          active ? "scale-y-100" : "scale-y-0",
        )}
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-start sm:items-center gap-3 py-3 pl-3 pr-3 sm:gap-4 sm:pl-4 sm:pr-4">
        {/* Play toggle */}
        <button
          type="button"
          onClick={onToggle}
          data-cursor="play"
          aria-pressed={active}
          aria-label={active ? `Stop ${track.title}` : `Play ${track.title}`}
          className={cn(
            "mt-1 sm:mt-0 grid size-11 shrink-0 place-items-center border transition-colors duration-[var(--duration-fast)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid",
            active
              ? "border-acid bg-acid text-void"
              : "border-border-strong text-bone hover:border-acid hover:text-acid",
          )}
        >
          {active ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 fill-current" />
          )}
        </button>

        <span className="label mt-1 sm:mt-0 hidden w-6 shrink-0 text-label-xs text-gray tabular-nums sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative mt-1 sm:mt-0 size-11 shrink-0 overflow-hidden border border-border">
          <Image
            src={track.artwork}
            alt=""
            fill
            sizes="44px"
            loading="lazy"
            className="object-cover"
          />
        </div>

        {/* Info Block */}
        <div className="min-w-0 flex-1 py-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "label text-label-sm leading-tight transition-colors",
                active ? "text-acid" : "text-bone",
              )}
            >
              {track.title}
            </p>
            <p className="label mt-0.5 text-label-xs leading-tight text-gray">
              {track.type} / {track.genre} / {track.productionLabel}
            </p>
            
            <div className="mt-2 flex flex-wrap items-center gap-3 sm:hidden">
              <span className="label text-label-xs text-bone-dim tabular-nums">{track.bpm} BPM</span>
              <span className="label text-label-xs text-bone-dim tabular-nums">{track.duration}</span>
              <TrackLinks track={track} locale={locale} />
            </div>
          </div>

          <span className="label hidden w-16 shrink-0 text-right text-label-xs text-bone-dim tabular-nums md:block">
            {track.bpm}
          </span>
          <span className="label hidden w-14 shrink-0 text-right text-label-xs text-bone-dim tabular-nums sm:block">
            {track.duration}
          </span>
          <div className="hidden shrink-0 text-right sm:block sm:w-32">
            <TrackLinks track={track} locale={locale} />
          </div>
        </div>
      </div>

      {active && (
        <span className="label absolute -top-px right-3 border border-acid bg-void px-1.5 text-label-xs text-acid sm:right-4">
          {locale === "en" ? "NOW SHOWING" : "AHORA MOSTRANDO"}
        </span>
      )}
    </li>
  );
}

/* ------------------------------------------------------------- HELPERS --- */

function TrackLinks({ track, locale }: { track: Track, locale: string }) {
  if (track.platforms && track.platforms.length > 0) {
    return (
      <select 
        className="bg-void border border-border text-acid text-xs py-1 px-2 rounded-none outline-none focus:border-acid cursor-pointer max-w-[120px] sm:max-w-full"
        onChange={(e) => {
          if (e.target.value) window.open(e.target.value, '_blank', 'noopener,noreferrer');
          e.target.value = ""; // reset después de click
        }}
        aria-label="Select platform"
      >
        <option value="">{locale === 'en' ? 'PLATFORMS' : 'PLATAFORMAS'}</option>
        {track.platforms.map((p) => (
          <option key={p.url} value={p.url}>{p.label}</option>
        ))}
      </select>
    );
  }

  if (track.externalUrl) {
    return (
      <a
        href={track.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="label inline-flex items-center gap-1 text-label-xs text-acid hover:underline"
      >
        {track.externalLabel}
        <ArrowUpRight className="size-3" aria-hidden="true" />
      </a>
    );
  }

  return <span className="label text-label-xs text-gray">{track.externalLabel}</span>;
}


/* ------------------------------------------------------------ NOW SHOWING -- */

function NowShowing({
  track,
  accent,
  audible,
  progress,
  duration: audioDuration,
  onSeek
}: {
  track: Track | null;
  accent: string;
  audible: boolean;
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  const { locale } = useLocale();
  const reduced = useReducedMotion();

  return (
    <div className="border border-border bg-charcoal/60 p-5">
      <div className="flex items-center justify-between">
        <span className="label text-label-xs text-gray">{locale === "en" ? "NOW SHOWING" : "AHORA MOSTRANDO"}</span>
        <span
          className="label text-label-xs"
          style={{ color: track ? accent : "var(--color-gray)" }}
        >
          {track ? (audible ? (locale === "en" ? "AUDIO LIVE" : "AUDIO EN VIVO") : (locale === "en" ? "PLAYING MUTED" : "REPRODUCIENDO SILENCIADO")) : (locale === "en" ? "IDLE" : "EN ESPERA")}
        </span>
      </div>

      <div className="relative mx-auto mt-4 aspect-square w-full max-w-sm overflow-hidden border border-border md:max-w-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={track?.id ?? "idle"}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.normal, ease: ease.out }}
          >
            {track ? (
              <motion.div
                className="absolute inset-0"
                animate={
                  reduced ? { rotate: 0 } : { rotate: 360 }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 48, ease: "linear", repeat: Infinity }
                }
                style={{
                  filter: `drop-shadow(0 0 28px ${accent}66)`,
                }}
              >
                <Image
                  src={track.artwork}
                  alt={`Placeholder artwork for ${track.title}`}
                  fill
                  sizes="(max-width: 767px) 100vw, 320px"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-void">
                <Disc3 className="size-12 text-border-strong" aria-hidden="true" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {track && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-void bg-void"
          />
        )}
        <div className="grain-layer" />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <p className="label text-label-sm text-bone">
          {track?.title ?? (locale === "en" ? "SELECT A TRACK" : "SELECCIONA UN TRACK")}
        </p>
        <p className="label text-label-xs text-gray">
          {track
            ? `${track.genre} / ${track.bpm} BPM / ${track.duration}`
            : (locale === "en" ? "PLAY ANY ROW TO PREVIEW" : "REPRODUCE CUALQUIER FILA PARA ESCUCHAR")}
        </p>
      </div>

      {/* Waveform visual */}
      <div className="mt-4 flex h-12 items-end gap-0.5 sm:gap-[3px]">
        {Array.from({ length: 32 }, (_, i) => {
          const base = 0.2 + Math.abs(Math.sin(i * 1.7)) * 0.8;
          return (
            <span
              key={i}
              className={cn(
                "flex-1 origin-bottom",
                track && !reduced && "animate-waveform",
              )}
              style={{
                height: `${(base * 100).toFixed(2)}%`,
                backgroundColor: track
                  ? i % 3 === 0
                    ? accent
                    : "var(--color-bone-dim)"
                  : "var(--color-border-strong)",
                opacity: track ? 0.7 : 0.4,
                animationDuration: "1.4s",
                animationDelay: `${(i % 6) * 0.09}s`,
              }}
            />
          );
        })}
      </div>

      {/* Barra de progreso / Playbar interactiva - Siempre visible si hay track */}
      {track && track.audioSrc && (
        <div className="mt-4 flex flex-col gap-2">
          <input 
            type="range" 
            min={0} 
            max={audioDuration || 100} 
            value={progress} 
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1 bg-border-strong rounded-none appearance-none cursor-pointer accent-acid"
            style={{ accentColor: accent }}
          />
          <div className="flex justify-between label text-[10px] text-gray tabular-nums">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      )}

      {/* Mensaje condicional dependiendo de la categoría */}
      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3">
        <p className="label text-label-xs text-gray">
          {!track
          ? (locale === "en" ? "SELECT A TRACK" : "ELIGE UN TRACK")
          : !track.audioSrc
          ? (locale === "en" ? "AUDIO PREVIEW COMING SOON — USE THE LINK TO LISTEN" : "PREVIEW DE AUDIO PRÓXIMAMENTE — ESCÚCHALO EN EL LINK")
          : track.category === "sets"
          ? (locale === "en" ? "PREVIEW ONLY. FULL SET ON THE LINKED PLATFORM." : "SÓLO PREVIEW. SET COMPLETO EN LA PLATAFORMA ENLAZADA.")
          : track?.audioSrc
          ? audible
            ? (locale === "en" ? "PLAYING LOCAL FILE" : "REPRODUCIENDO ARCHIVO LOCAL")
            : (locale === "en" ? "PLAYING IN BACKGROUND" : "REPRODUCIENDO DE FONDO")
          : "OVER EMOTIONS"}
        </p>
      </div>
    </div>
  );
}

export default MusicLab;