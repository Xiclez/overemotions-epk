/**
 * ============================================================================
 * OVER EMOTIONS — PRESS KIT CONTENT
 * ============================================================================
 *
 * SINGLE SOURCE OF TRUTH for every piece of editable content on the site.
 * No artist copy, link, genre, statistic or contact detail lives anywhere else.
 *
 * HOW TO READ THE MARKERS
 * -----------------------
 *   TODO_REPLACE   Placeholder copy written by the design team. Reads well, but it
 *                  is NOT the artist's approved wording. Replace before launch.
 *   [BRACKETS]     Deliberately unverified fact. Rendered on screen with the
 *                  brackets intact so nothing invented is ever presented as real.
 *   null           Asset does not exist yet. The UI renders "ASSET PENDING" or a
 *                  generated placeholder instead of a broken link.
 *
 * LOCALISATION
 * ------------
 * Strings that will eventually need Spanish are typed as `Localized` — today they
 * hold `{ en: "..." }` only. Adding `es` later is additive and type-safe; nothing
 * else in the codebase changes. This is intentionally NOT a full i18n system.
 */

/* ---------------------------------------------------------------- TYPES --- */

export type Locale = "en" | "es";

/** A string that may gain translations later. `en` is required, `es` optional. */
export type Localized = { en: string; es?: string };

export type ModeId = "psytrance" | "psytech";

export interface MusicalMode {
  id: ModeId;
  /** Short label used on the dial and in badges. */
  label: string;
  /** Long-form name for headings. */
  title: string;
  /** Shown as the BPM readout. A string so OPEN FORMAT can say "READ THE ROOM". */
  bpm: string;
  /** Numeric BPM used to drive animation tempo. Open format sits in between. */
  bpmValue: number;
  /** Slash-separated context list rendered under the dial. */
  contexts: string;
  description: Localized;
  /** Secondary accent. Orange is a constant across all modes — see globals.css. */
  accent: string;
  /** Deep tint used for background washes and 3D rim light. */
  tint: string;
  /** Shader personality. Consumed by <MeltShader mode=...>. */
  shader: {
    /** Time multiplier. Higher = faster melt. */
    speed: number;
    /** Colour presence in the melt. */
    intensity: number;
  };
  /** Motion character label, surfaced in the style guide. */
  motionCharacter: string;
}

export interface StoryBlock {
  id: string;
  index: string;
  /** Oversized background word behind the block. */
  keyword: Localized;
  heading: Localized;
  body: Localized;
  /** Sticky visual for this block. Placeholder until real photography exists. */
  image: string;
  imageAlt: string;
}

export interface ShowFormat {
  id: string;
  mode: ModeId;
  name: Localized;
  tagline: Localized;
  description: Localized;
  eventType: Localized;
  /** 1-5. Rendered as a discrete meter, never as invented percentages. */
  intensity: number;
  intensityLabel: Localized;
  genres: string[];
  duration: string;
  cta: Localized;
}

export type TrackCategory = "releases" | "sets" ;

export interface Track {
  id: string;
  category: TrackCategory;
  title: string;
  type: string;
  genre: string;
  bpm: string;
  duration: string;
  /** e.g. "SELF-RELEASED" / "[LABEL TBC]". Never invent a real label. */
  productionLabel: string;
  artwork: string;
  /** External platform link. `null` renders a disabled "LINK PENDING" state. */
  externalUrl: string | null;
  externalLabel?: string;
  platforms?: { label: string; url: string }[];
  /**
   * Drop an mp3 in /public/media/audio and point here to make the player audible.
   * `null` keeps the player visual-only (see README > Connecting real audio).
   */
  audioSrc: string | null;
}

export interface ArchiveItem {
  id: string;
  venue: string | Localized;
  city: string | Localized;
  date: string | Localized;
  /** Ruta del video (.mp4/.webm). `null` muestra el poster como placeholder. */
  video: string | null;
  /** Poster / thumbnail. También se usa mientras no hay video. */
  poster: string;
  imageAlt: string;
  scale: "sm" | "md" | "lg";
  mode: ModeId;
}

export interface VaultAsset {
  id: string;
  name: string;
  description: Localized;
  /** File type badge. */
  format: string;
  /** Human-readable size, or null when the asset does not exist yet. */
  size: string | null;
  /** null → renders "ASSET PENDING" and is not clickable. */
  href: string | null;
  icon: VaultIcon;
}

export type VaultIcon =
  | "document"
  | "text"
  | "image"
  | "package"
  | "logo"
  | "wrench"
  | "coffee"
  | "video";

/* ------------------------------------------------------------- IDENTITY --- */

export function getText(value: string | Localized | undefined, locale: Locale = "en") {
  if (typeof value === "string") return value;
  if (locale === "es" && value?.es) return value.es;
  return value?.en ?? "";
}

export const artist = {
  name: "OVER EMOTIONS",
  /** Logo 2026 (hero) y logo retro (usos pequeños). PNG transparentes. */
  logos: {
    hero: { src: "/media/brand/overemotions-logo-2026-web.webp", width: 1600, height: 943 },
    retro: { src: "/media/brand/overemotions-logo-retro-web.webp", width: 900, height: 252 },
  },
  /** Split for the layered hero composition. */
  nameParts: ["OVER", "EMOTIONS"] as const,
  realName: "Humberto Loya",
  role: { en: "PSYTRANCE PRODUCER / DJ", es: "PRODUCTOR / DJ DE PSYTRANCE" } as Localized,
  origin: { en: "CHIHUAHUA, MEXICO", es: "CHIHUAHUA, MÉXICO" } as Localized,
  /** Rendered as the hero genre strip. */
  genreStrip: {
    en: "PSYTRANCE / FULL ON / PROGRESSIVE TRANCE / PSYTECH",
    es: "PSYTRANCE / FULL ON / PROGRESSIVE TRANCE / PSYTECH",
  } as Localized,
  /** Artist's own words (PDF — visión artística). */
  positioning: {
    line1: {
      en: "A sound experience that connects mind and body,",
      es: "Una experiencia sonora que conecta mente y cuerpo,",
    },
    line2: {
      en: "taking the crowd on a deep journey through the power of music.",
      es: "llevando al público a un viaje profundo a través del poder de la música.",
    },
  },
  concept: { en: "MIND AND BODY", es: "MENTE Y CUERPO" } as Localized,
  metaDescription: {
    en: "Over Emotions — psytrance project by Mexican producer Humberto Loya, from Chihuahua. Active since 2010. Press kit, music, sets, rider and booking.",
    es: "Over Emotions — proyecto de psytrance del productor mexicano Humberto Loya, originario de Chihuahua. Activo desde 2010. Press kit, música, sets, rider y booking.",
  } as Localized,
} as const;

/* ------------------------------------------------------------------ BIO --- */

export const bio = {
  oneLiner: {
    en: "Psytrance project by Mexican producer Humberto Loya. Active since 2010.",
    es: "Proyecto de psytrance del productor mexicano Humberto Loya. Activo desde 2010.",
  } as Localized,

  /** PDF — biografía corta. */
  short: {
    en: "Over Emotions is the psytrance project of Mexican producer Humberto Loya, from Chihuahua, Mexico. Active since 2010, his music is defined by intense sounds, deep atmospheres and a strong emotional charge on the dancefloor.",
    es: "Over Emotions es el proyecto de psytrance del productor mexicano Humberto Loya, originario de Chihuahua, México. Activo desde 2010, su música se caracteriza por sonidos intensos, atmósferas profundas y una fuerte carga emocional en la pista de baile.",
  } as Localized,

  /** PDF — biografía (condensada). */
  long: {
    en: "Humberto Loya, known in electronic music as Over Emotions, is a producer from Chihuahua, Mexico, who has left his mark on the psytrance scene since 2010.\n\nInspired by artists such as Astrix, Bizzare Contact, InterSys and Mad Maxx, he builds sounds that fuse the dark, the melodic, the energetic and the introspective. He has shared the stage at festivals and clubs across Mexico with Astrix, Berg, Bizzare Contact, Interactive Noise, Mad Maxx, Mandragora, Major7, Menog, Omiki, Paranormal Attack and X-Noize, among others.\n\nIn 2013 he released his first EP, \"Demons In My Head\", on Belgian label Green Tree Records. After a hiatus, he returned in 2023 with renewed strength and a fresh sound.",
    es: "Humberto Loya, conocido en el mundo de la música electrónica como Over Emotions, es un productor originario de Chihuahua, México, que ha dejado huella en la escena del psytrance desde sus inicios en 2010.\n\nInspirado por artistas como Astrix, Bizzare Contact, InterSys y Mad Maxx, crea sonidos que fusionan lo oscuro, melódico, enérgico y lo introspectivo. Ha compartido escenario en festivales y clubs alrededor de México con Astrix, Berg, Bizzare Contact, Interactive Noise, Mad Maxx, Mandragora, Major7, Menog, Omiki, Paranormal Attack y X-Noize, entre otros.\n\nEn 2013 lanzó su primer EP, \"Demons In My Head\", a través del sello belga Green Tree Records. Después de un receso, en 2023 regresó renovado, con fuerza y con un sonido fresco.",
  } as Localized,
} as const;

/* -------------------------------------------------------- MUSICAL MODES --- */
/**
 * Dos modos = los dos sets disponibles en el press kit (Psytrance / Psytech).
 * Cada uno cambia la paleta y el carácter del shader, y los acentos del sitio.
 */
export const modes: MusicalMode[] = [
  {
    id: "psytrance",
    label: "PSYTRANCE",
    title: "PSYTRANCE",
    bpm: "136 — 145",
    bpmValue: 143,
    contexts: "FESTIVAL / CLUB / FULL ON / PROGRESSIVE",
    description: {
      en: "Full on and progressive psytrance: hypnotic rhythms, enveloping atmospheres and melodies with emotional weight.",
      es: "Psytrance full on y progressive: ritmos hipnóticos, atmósferas envolventes y melodías con carga emocional.",
    },
    accent: "#FF4FC3",
    tint: "#1E0830",
    shader: { speed: 0.9, intensity: 0.86 },
    motionCharacter: "LIQUID / EUPHORIC",
  },
  {
    id: "psytech",
    label: "PSYTECH",
    title: "PSYTECH",
    bpm: "136 — 145",
    bpmValue: 138,
    contexts: "CLUB / NIGHT / DARK ROOM",
    description: {
      en: "Where psytrance meets techno: tighter, darker, more hypnotic. Rolling basslines and acid textures.",
      es: "Donde el psytrance se cruza con el techno: más cerrado, oscuro e hipnótico. Bajos rodantes y texturas ácidas.",
    },
    accent: "#2BF0C4",
    tint: "#04201E",
    shader: { speed: 1.1, intensity: 0.82 },
    motionCharacter: "HYPNOTIC / METALLIC",
  },
];

export const defaultModeId: ModeId = "psytrance";

export const getMode = (id: ModeId): MusicalMode =>
  modes.find((m) => m.id === id) ?? modes[0];

/* ------------------------------------------------------------- SECTIONS --- */

export const sections = [
  { id: "hero", number: "01", label: { en: "INTRO", es: "INTRO" } as Localized },
  { id: "story", number: "02", label: { en: "THE JOURNEY", es: "EL VIAJE" } as Localized },
  { id: "credibility", number: "03", label: { en: "TRACK RECORD", es: "TRAYECTORIA" } as Localized },
  { id: "formats", number: "04", label: { en: "SETS", es: "SETS" } as Localized },
  { id: "music", number: "05", label: { en: "MUSIC", es: "MÚSICA" } as Localized },
  { id: "archive", number: "06", label: { en: "LIVE", es: "EN VIVO" } as Localized },
  { id: "vault", number: "07", label: { en: "PRESS KIT", es: "PRESS KIT" } as Localized },
  { id: "booking", number: "08", label: { en: "BOOKING", es: "BOOKING" } as Localized },
] as const;

export const navItems = [
  { id: "formats", label: { en: "SETS", es: "SETS" } as Localized },
  { id: "music", label: { en: "MUSIC", es: "MÚSICA" } as Localized },
  { id: "vault", label: { en: "PRESS KIT", es: "PRESS KIT" } as Localized },
  { id: "booking", label: { en: "BOOKING", es: "BOOKING" } as Localized },
] as const;

/* ---------------------------------------------------------------- INTRO --- */

export const intro = {
  statusText: { en: "TUNING INTO THE FREQUENCY", es: "SINTONIZANDO LA FRECUENCIA" } as Localized,
  /** Logo retro: tamaños pequeños (splash, header, footer). */
  symbolSrc: "/media/brand/overemotions-logo-retro-web.webp",
  soundOn: { en: "ENTER WITH SOUND", es: "ENTRAR CON SONIDO" } as Localized,
  soundOff: { en: "ENTER SILENT", es: "ENTRAR EN SILENCIO" } as Localized,
  note: { en: "AUDIO OFF BY DEFAULT", es: "AUDIO APAGADO POR DEFECTO" } as Localized,
} as const;

/* ----------------------------------------------------------------- HERO --- */

export const hero = {
  primaryCta: { en: "SEE THE SETS", es: "VER LOS SETS" } as Localized,
  secondaryCta: { en: "BOOKING DOSSIER", es: "DOSSIER DE BOOKING" } as Localized,
  scrollHint: { en: "SCROLL", es: "DESLIZA" } as Localized,
  readouts: [
    { label: { en: "SINCE", es: "DESDE" } as Localized, value: { en: "2010", es: "2010" } as Localized },
    { label: { en: "RANGE", es: "RANGO" } as Localized, value: { en: "136 — 145 BPM", es: "136 — 145 BPM" } as Localized },
    { label: { en: "BASE", es: "BASE" } as Localized, value: { en: "CHIHUAHUA, MX", es: "CHIHUAHUA, MX" } as Localized },
    { label: { en: "STATUS", es: "ESTADO" } as Localized, value: { en: "TAKING BOOKINGS", es: "ABIERTO A BOOKING" } as Localized },
  ],
} as const;

/* ------------------------------------------------------------ THE STORY --- */
/** Cronología tomada de la biografía del PDF. Imágenes = placeholders. */
export const story: StoryBlock[] = [
  {
    id: "origin",
    index: "2010",
    keyword: { en: "ORIGIN", es: "ORIGEN" },
    heading: { en: "BORN IN CHIHUAHUA", es: "NACIDO EN CHIHUAHUA" },
    body: {
      en: "Humberto Loya started Over Emotions in 2010, in Chihuahua, Mexico. From an early age he was drawn to electronic music, and above all to the powerful, enigmatic world of psytrance.",
      es: "Humberto Loya inició Over Emotions en 2010, en Chihuahua, México. Desde muy joven se sintió atraído por la música electrónica y, sobre todo, por el poderoso y enigmático mundo del psytrance.",
    },
    image: "/placeholders/story-01.svg",
    imageAlt: "Placeholder — retrato del artista",
  },
  {
    id: "sound",
    index: "SOUND",
    keyword: { en: "SOUND", es: "SONIDO" },
    heading: { en: "DARK, MELODIC, INTROSPECTIVE", es: "OSCURO, MELÓDICO, INTROSPECTIVO" },
    body: {
      en: "Inspired by Astrix, Bizzare Contact, InterSys and Mad Maxx, he builds tracks that fuse darkness and melody, energy and introspection — intense sounds with a strong emotional charge.",
      es: "Inspirado por Astrix, Bizzare Contact, InterSys y Mad Maxx, construye tracks que fusionan lo oscuro y lo melódico, lo enérgico y lo introspectivo: sonidos intensos con una fuerte carga emocional.",
    },
    image: "/placeholders/story-02.svg",
    imageAlt: "Placeholder — estudio de producción",
  },
  {
    id: "stage",
    index: "STAGE",
    keyword: { en: "STAGE", es: "ESCENARIO" },
    heading: { en: "SHARED STAGES", es: "ESCENARIOS COMPARTIDOS" },
    body: {
      en: "He quickly earned recognition in the local scene, playing festivals and clubs across Mexico alongside some of the biggest names in psytrance. His hypnotic rhythms and enveloping atmospheres made him one of the most promising talents of his generation.",
      es: "Rápidamente ganó reconocimiento en la escena local, tocando en festivales y clubs de todo México junto a algunos de los nombres más destacados del psytrance. Sus ritmos hipnóticos y atmósferas envolventes lo posicionaron como uno de los talentos más prometedores de su generación.",
    },
    image: "/placeholders/story-03.svg",
    imageAlt: "Placeholder — público en festival",
  },
  {
    id: "ep",
    index: "2013",
    keyword: { en: "DEMONS", es: "DEMONS" },
    heading: { en: "DEMONS IN MY HEAD", es: "DEMONS IN MY HEAD" },
    body: {
      en: "In 2013 he released his first EP, \"Demons In My Head\", on Belgian label Green Tree Records — the release that placed Over Emotions on the international psytrance map.",
      es: "En 2013 lanzó su primer EP, \"Demons In My Head\", a través del sello belga Green Tree Records: el lanzamiento que colocó a Over Emotions en el mapa internacional del psytrance.",
    },
    image: "/placeholders/story-04.svg",
    imageAlt: "Placeholder — portada del EP",
  },
  {
    id: "return",
    index: "2023",
    keyword: { en: "RETURN", es: "REGRESO" },
    heading: { en: "THE RETURN", es: "EL REGRESO" },
    body: {
      en: "After a hiatus, Over Emotions came back in 2023 renewed, with new influences and a fresh sound — proof of an artist able to evolve with the scene while keeping his identity intact.",
      es: "Después de un receso, Over Emotions regresó en 2023 renovado, con nuevas influencias y un sonido fresco: la prueba de un artista capaz de evolucionar con la escena sin perder su identidad.",
    },
    image: "/placeholders/story-05.svg",
    imageAlt: "Placeholder — artista en cabina",
  },
];

/* ------------------------------------------------------------- SHOWREEL --- */
/** Sección no montada en la página actual; se conserva para cuando haya video. */
export const showreel = {
  title: { en: "SHOWREEL", es: "SHOWREEL" } as Localized,
  kicker: { en: "THE JOURNEY IN 60 SECONDS", es: "EL VIAJE EN 60 SEGUNDOS" } as Localized,
  videoSrc: null as string | null,
  poster: "/placeholders/showreel-poster.svg",
  posterAlt: "Showreel poster placeholder",
  cta: { en: "WATCH FULL SHOWREEL", es: "VER SHOWREEL COMPLETO" } as Localized,
  beats: [
    { id: "intro", label: { en: "THE INTRO", es: "LA INTRO" } as Localized, copy: { en: "The room tunes in.", es: "La sala sintoniza." } as Localized },
    { id: "build", label: { en: "THE BUILD", es: "EL BUILD" } as Localized, copy: { en: "Mind and body align.", es: "Mente y cuerpo se alinean." } as Localized },
    { id: "trip", label: { en: "THE JOURNEY", es: "EL VIAJE" } as Localized, copy: { en: "Deeper, further.", es: "Más profundo, más lejos." } as Localized },
    { id: "drop", label: { en: "THE DROP", es: "EL DROP" } as Localized, copy: { en: "Everything lands at once.", es: "Todo cae a la vez." } as Localized },
  ],
  duration: "[DURACIÓN]",
} as const;

/* ------------------------------------------------------ BOOKABLE FORMATS --- */
/** PDF — sets disponibles: Psytrance / Psytech. Duración 60–120 min. */
export const formats: ShowFormat[] = [
  {
    id: "psytrance-set",
    mode: "psytrance",
    name: { en: "PSYTRANCE SET", es: "SET PSYTRANCE" },
    tagline: {
      en: "Full on and progressive psytrance for festivals and peak hours.",
      es: "Psytrance full on y progressive para festivales y horas pico.",
    },
    description: {
      en: "The core of the project: hypnotic rhythms, enveloping atmospheres and melodies with emotional weight. A journey built to connect mind and body on the dancefloor.",
      es: "El núcleo del proyecto: ritmos hipnóticos, atmósferas envolventes y melodías con carga emocional. Un viaje construido para conectar mente y cuerpo en la pista.",
    },
    eventType: { en: "FESTIVAL / CLUB", es: "FESTIVAL / CLUB" },
    intensity: 5,
    intensityLabel: { en: "PEAK", es: "PICO" },
    genres: ["PSYTRANCE", "FULL ON", "PROGRESSIVE TRANCE"],
    duration: "60 — 120 MIN",
    cta: { en: "BOOK THIS SET", es: "RESERVAR ESTE SET" },
  },
  {
    id: "psytech-set",
    mode: "psytech",
    name: { en: "PSYTECH SET", es: "SET PSYTECH" },
    tagline: {
      en: "Psytrance energy with techno's weight and darkness.",
      es: "La energía del psytrance con el peso y la oscuridad del techno.",
    },
    description: {
      en: "Tighter, darker and more hypnotic. Rolling basslines, acid textures and a steady pressure designed for clubs and late-night slots.",
      es: "Más cerrado, oscuro e hipnótico. Bajos rodantes, texturas ácidas y una presión constante pensada para clubs y horarios nocturnos.",
    },
    eventType: { en: "CLUB / NIGHT", es: "CLUB / NOCHE" },
    intensity: 4,
    intensityLabel: { en: "HYPNOTIC", es: "HIPNÓTICO" },
    genres: ["PSYTECH", "PSYTRANCE", "TECHNO"],
    duration: "60 — 120 MIN",
    cta: { en: "BOOK THIS SET", es: "RESERVAR ESTE SET" },
  },
];

/* ------------------------------------------------------------ MUSIC LAB --- */

export const musicTabs = [
  { id: "releases" as TrackCategory, label: { en: "RELEASES", es: "LANZAMIENTOS" } as Localized },
  { id: "sets" as TrackCategory, label: { en: "DJ SETS", es: "SETS DJ" } as Localized },
];

const SPOTIFY_ARTIST =
  "https://open.spotify.com/intl-es/artist/4W3GskkqHALbnRDsd6p72G?si=c8rCMEqrTC-Qv32-Dw1f8A";
const SOUNDCLOUD = "https://soundcloud.com/over_emotions";
const YOUTUBE = "https://www.youtube.com/channel/UCFSvgX-gLHYmAgeiF5o7ZYg";

/**
 * Títulos reales (PDF — lista de canciones). BPM, duración, portada, audio y
 * links por track quedan pendientes: van entre [CORCHETES] hasta confirmarlos.
 */
export const music: Track[] = [
  {
    id: "r1",
    category: "releases",
    title: "OUT OF YOUR LOVE",
    type: "ORIGINAL",
    genre: "PSYTRANCE",
    bpm: "[BPM]",
    duration: "[—:—]",
    productionLabel: "[SELLO]",
    artwork: "/placeholders/art-01.svg",
    externalUrl: SPOTIFY_ARTIST,
    externalLabel: "SPOTIFY",
    audioSrc: null,
  },
  {
    id: "r2",
    category: "releases",
    title: "FREAKERS",
    type: "ORIGINAL",
    genre: "PSYTRANCE",
    bpm: "[BPM]",
    duration: "[—:—]",
    productionLabel: "[SELLO]",
    artwork: "/placeholders/art-02.svg",
    externalUrl: SPOTIFY_ARTIST,
    externalLabel: "SPOTIFY",
    audioSrc: null,
  },
  {
    id: "r3",
    category: "releases",
    title: "SPACE",
    type: "ORIGINAL",
    genre: "PSYTRANCE",
    bpm: "[BPM]",
    duration: "[—:—]",
    productionLabel: "[SELLO]",
    artwork: "/placeholders/art-03.svg",
    externalUrl: SPOTIFY_ARTIST,
    externalLabel: "SPOTIFY",
    audioSrc: null,
  },
  {
    id: "r4",
    category: "releases",
    title: "ARTIFICIAL INTELLIGENCE",
    type: "ORIGINAL",
    genre: "PSYTRANCE",
    bpm: "[BPM]",
    duration: "[—:—]",
    productionLabel: "[SELLO]",
    artwork: "/placeholders/art-04.svg",
    externalUrl: SPOTIFY_ARTIST,
    externalLabel: "SPOTIFY",
    audioSrc: null,
  },
  {
    id: "r5",
    category: "releases",
    title: "DEMONS IN MY HEAD",
    type: "EP / 2013",
    genre: "PSYTRANCE",
    bpm: "[BPM]",
    duration: "[—:—]",
    productionLabel: "GREEN TREE RECORDS",
    artwork: "/placeholders/art-05.svg",
    externalUrl: null,
    externalLabel: "[LINK PENDIENTE]",
    audioSrc: null,
  },
  {
    id: "s1",
    category: "sets",
    title: "[SET PSYTRANCE — PENDIENTE]",
    type: "LIVE SET",
    genre: "PSYTRANCE",
    bpm: "136 — 145",
    duration: "[—:—]",
    productionLabel: "RECORDED LIVE",
    artwork: "/placeholders/art-06.svg",
    externalUrl: SOUNDCLOUD,
    externalLabel: "SOUNDCLOUD",
    audioSrc: null,
  },
  {
    id: "s2",
    category: "sets",
    title: "[SET PSYTECH — PENDIENTE]",
    type: "LIVE SET",
    genre: "PSYTECH",
    bpm: "136 — 145",
    duration: "[—:—]",
    productionLabel: "RECORDED LIVE",
    artwork: "/placeholders/art-07.svg",
    externalUrl: YOUTUBE,
    externalLabel: "YOUTUBE",
    audioSrc: null,
  },
];

/* ---------------------------------------------------------- LIVE ARCHIVE --- */
/** Videos pendientes: se muestra el poster hasta que exista `video`. */
export const archive: ArchiveItem[] = [
  { id: "a1", venue: "[FESTIVAL / CLUB]", city: "[CIUDAD]", date: "[FECHA]", video: null, poster: "/placeholders/live-01.svg", imageAlt: "Placeholder — video en vivo", scale: "lg", mode: "psytrance" },
  { id: "a2", venue: "[FESTIVAL / CLUB]", city: "[CIUDAD]", date: "[FECHA]", video: null, poster: "/placeholders/live-02.svg", imageAlt: "Placeholder — video en vivo", scale: "md", mode: "psytech" },
  { id: "a3", venue: "[FESTIVAL / CLUB]", city: "[CIUDAD]", date: "[FECHA]", video: null, poster: "/placeholders/live-03.svg", imageAlt: "Placeholder — video en vivo", scale: "sm", mode: "psytrance" },
  { id: "a4", venue: "[FESTIVAL / CLUB]", city: "[CIUDAD]", date: "[FECHA]", video: null, poster: "/placeholders/live-04.svg", imageAlt: "Placeholder — video en vivo", scale: "lg", mode: "psytech" },
  { id: "a5", venue: "[FESTIVAL / CLUB]", city: "[CIUDAD]", date: "[FECHA]", video: null, poster: "/placeholders/live-05.svg", imageAlt: "Placeholder — video en vivo", scale: "md", mode: "psytrance" },
  { id: "a6", venue: "[FESTIVAL / CLUB]", city: "[CIUDAD]", date: "[FECHA]", video: null, poster: "/placeholders/live-06.svg", imageAlt: "Placeholder — video en vivo", scale: "sm", mode: "psytech" },
];

/* ----------------------------------------------------------- CREDIBILITY --- */
/** Todo lo de aquí sale del PDF del artista. */
export const credibility = {
  stats: [
    { label: { en: "ACTIVE SINCE", es: "ACTIVO DESDE" } as Localized, value: { en: "2010", es: "2010" } as Localized },
    { label: { en: "FIRST EP", es: "PRIMER EP" } as Localized, value: { en: "2013", es: "2013" } as Localized },
    { label: { en: "LABEL", es: "SELLO" } as Localized, value: { en: "GREEN TREE (BE)", es: "GREEN TREE (BE)" } as Localized },
    { label: { en: "THE RETURN", es: "EL REGRESO" } as Localized, value: { en: "2023", es: "2023" } as Localized },
  ],
  /** PDF — ha compartido escenario con: */
  sharedStage: [
    "ASTRIX",
    "BERG",
    "BIZZARE CONTACT",
    "INTERACTIVE NOISE",
    "MAD MAXX",
    "MANDRAGORA",
    "MAJOR7",
    "MENOG",
    "OMIKI",
    "PARANORMAL ATTACK",
    "X-NOIZE",
  ],
  influences: ["ASTRIX", "BIZZARE CONTACT", "INTERSYS", "MAD MAXX"],
  release: {
    title: "DEMONS IN MY HEAD",
    type: { en: "EP", es: "EP" } as Localized,
    year: "2013",
    label: "GREEN TREE RECORDS",
    labelOrigin: { en: "BELGIUM", es: "BÉLGICA" } as Localized,
  },
} as const;

/* -------------------------------------------------------- DOWNLOAD VAULT --- */

export const vault: VaultAsset[] = [
  {
    id: "presskit-pdf",
    name: "PRESS KIT PDF",
    description: { en: "Bio, short bio, artistic vision, genres, sets, rider and links.", es: "Biografía, bio corta, visión artística, géneros, sets, rider y enlaces." },
    format: "PDF",
    size: "84KB",
    href: "/media/docs/Over_Emotions_Press_Kit.pdf",
    icon: "document",
  },
  {
    id: "tech-rider",
    name: "TECH RIDER",
    description: { en: "Booth requirements. Included in the press kit PDF.", es: "Requisitos de cabina. Incluido en el PDF del press kit." },
    format: "PDF",
    size: "84KB",
    href: "/media/docs/Over_Emotions_Press_Kit.pdf",
    icon: "wrench",
  },
  {
    id: "press-photos",
    name: "PRESS PHOTOS",
    description: { en: "High-resolution live and portrait selection.", es: "Selección de fotos en vivo y retratos en alta resolución." },
    format: "ZIP",
    size: null,
    href: null,
    icon: "image",
  },
  {
    id: "logo-pack",
    name: "LOGO PACK",
    description: { en: "2026 and retro logos. Transparent PNG and on black, 3000 px.", es: "Logos 2026 y retro. PNG transparente y sobre negro, 3000 px." },
    format: "ZIP",
    size: "3.6MB",
    href: "/media/docs/Over_Emotions_Logo_Pack.zip",
    icon: "package",
  },
];

/* --------------------------------------------------------------- BOOKING --- */

export const booking = {
  headline: {
    line1: { en: "TAKE YOUR CROWD", es: "LLEVA A TU PÚBLICO" },
    line2: { en: "ON THE JOURNEY.", es: "DE VIAJE." },
  },
  intro: {
    en: "Send the date, the venue and the crowd. You'll get a clear answer on set, availability and conditions.",
    es: "Envía la fecha, el venue y el tipo de público. Recibirás una respuesta clara sobre set, disponibilidad y condiciones.",
  } as Localized,
  primaryCta: { en: "BOOK OVER EMOTIONS", es: "CONTRATAR A OVER EMOTIONS" } as Localized,
  secondaryCta: { en: "DOWNLOAD PRESS KIT", es: "DESCARGAR PRESS KIT" } as Localized,
  confirmationTitle: { en: "EMAIL READY", es: "CORREO LISTO" } as Localized,
  confirmationBody: {
    en: "Your email app should have opened with the enquiry filled in. If it didn't, write directly to the address below.",
    es: "Tu app de correo debió abrirse con la solicitud ya redactada. Si no se abrió, escribe directamente al correo de abajo.",
  } as Localized,
  eventTypes: [
    { en: "FESTIVAL", es: "FESTIVAL" },
    { en: "CLUB", es: "CLUB" },
    { en: "OPEN AIR", es: "OPEN AIR" },
    { en: "PRIVATE EVENT", es: "EVENTO PRIVADO" },
    { en: "OTHER", es: "OTRO" },
  ] as Localized[],
  attendanceBands: [
    { en: "UNDER 200", es: "MENOS DE 200" },
    { en: "200 — 500", es: "200 — 500" },
    { en: "500 — 1,500", es: "500 — 1,500" },
    { en: "1,500 — 5,000", es: "1,500 — 5,000" },
    { en: "5,000+", es: "5,000+" },
  ] as Localized[],
} as const;

/* --------------------------------------------------------------- CONTACT --- */

export const contact = {
  bookingEmail: "over.emotions.live.act@gmail.com",
  /** Formato internacional, sólo dígitos. `null` oculta todos los botones de WhatsApp. */
  whatsapp: "526141548922" as string | null,
  whatsappDisplay: "+52 614 154 8922",
  instagram: "https://www.instagram.com/over.emotions.music",
  instagramHandle: "@over.emotions.music",
  socials: [
    { id: "instagram", label: "INSTAGRAM", href: "https://www.instagram.com/over.emotions.music" },
    { id: "spotify", label: "SPOTIFY", href: SPOTIFY_ARTIST },
    { id: "soundcloud", label: "SOUNDCLOUD", href: SOUNDCLOUD },
    { id: "youtube", label: "YOUTUBE", href: YOUTUBE },
    { id: "facebook", label: "FACEBOOK", href: "https://www.facebook.com/share/17178BCjRt/?mibextid=wwXIfr" },
    { id: "linktree", label: "LINKTREE", href: "https://linktr.ee/over_emotions" },
  ] as { id: string; label: string; href: string | null }[],
  territory: "MÉXICO / WORLDWIDE",
} as const;

/* ---------------------------------------------------- BOOKING DOSSIER ----- */

export const dossier = {
  triggerLabel: { en: "BOOKING DOSSIER", es: "DOSSIER DE BOOKING" } as Localized,
  title: { en: "BOOKING DOSSIER", es: "DOSSIER DE BOOKING" } as Localized,
  subtitle: { en: "EVERYTHING A PROMOTER NEEDS, IN ONE PANEL", es: "TODO LO QUE NECESITA UN PROMOTOR, EN UN PANEL" } as Localized,
  sections: {
    bio: { en: "SHORT BIO", es: "BIO CORTA" } as Localized,
    genres: { en: "GENRES", es: "GÉNEROS" } as Localized,
    formats: { en: "SETS", es: "SETS" } as Localized,
    showreel: { en: "SHOWREEL", es: "SHOWREEL" } as Localized,
    music: { en: "MUSIC", es: "MÚSICA" } as Localized,
    photos: { en: "PRESS PHOTOS", es: "FOTOS DE PRENSA" } as Localized,
    rider: { en: "TECHNICAL RIDER", es: "RIDER TÉCNICO" } as Localized,
    contact: { en: "CONTACT", es: "CONTACTO" } as Localized,
  },
  genres: ["PSYTRANCE", "FULL ON", "PROGRESSIVE TRANCE", "PSYTECH"],
  /** PDF — rider técnico. */
  riderNote: {
    en: "Pioneer DJ / AlphaTheta: 2× CDJ-2000 or CDJ-3000 (XDJ series compatible), DJM-900 or DJM-V10 mixer, booth monitors, headphone cue, DJ table, power supply, booth lighting (preferred). Rekordbox. Adapts to standard club setups and venue conditions.",
    es: "Pioneer DJ / AlphaTheta: 2× CDJ-2000 o CDJ-3000 (compatible serie XDJ), mixer DJM-900 o DJM-V10, monitores de cabina, cue de audífonos, mesa de DJ, suministro eléctrico, iluminación de cabina (preferible). Rekordbox. Se adapta a configuración estándar de club y a las condiciones del venue.",
  } as Localized,
  bookCta: { en: "BOOK OVER EMOTIONS", es: "CONTRATAR A OVER EMOTIONS" } as Localized,
} as const;

/* ---------------------------------------------------------------- FOOTER --- */

export const footer = {
  tagline: { en: "PSYTRANCE FROM CHIHUAHUA, MEXICO. SINCE 2010.", es: "PSYTRANCE DESDE CHIHUAHUA, MÉXICO. DESDE 2010." } as Localized,
  mockupNotice: {
    en: "Work in progress — some music, video and photo assets are still placeholders.",
    es: "En construcción — parte de la música, videos y fotos todavía son de ejemplo.",
  } as Localized,
  credit: { en: "OFFICIAL ELECTRONIC PRESS KIT", es: "PRESS KIT ELECTRÓNICO OFICIAL" } as Localized,
  styleGuideLabel: { en: "STYLE GUIDE", es: "GUÍA DE ESTILO" } as Localized,
} as const;

/* ------------------------------------------------------------- 3D / MEDIA --- */

export const media = {
  /** Ambient loop used only after an explicit ENTER WITH SOUND. Never autoplays. */
  ambientAudioSrc: null as string | null,
} as const;
