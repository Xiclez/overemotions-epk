# OVER EMOTIONS — Electronic Press Kit

Press kit web de **Over Emotions** (Humberto Loya), productor y DJ de psytrance de Chihuahua, México.
Basado en la arquitectura del EPK de Rey Calaca (Next.js 16 + Tailwind 4 + three.js + Motion).

## Correr / desplegar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (Vercel lo hace solo)
```

Las fuentes están dentro del proyecto (`app/fonts`), así que el build no depende de Google Fonts.

## Dónde se edita todo

**`data/presskit.ts`** es la única fuente de contenido: bios, sets, música, archivo en vivo,
trayectoria, descargas, contacto y textos en ES/EN. Todo lo que está entre `[CORCHETES]` es un dato pendiente.

| Qué | Dónde |
|---|---|
| Logos (2026 = hero, retro = header/splash/footer) | `public/media/brand/` + `artist.logos` |
| Press kit PDF / logo pack | `public/media/docs/` + `vault` |
| Portadas de tracks | `public/media/artwork/` → `music[].artwork` |
| Audios (preview en el Music Lab) | `public/media/audio/` → `music[].audioSrc` |
| Videos en vivo | `public/media/videos/` → `archive[].video` (+ `poster`) |
| Fotos de la historia | `public/media/photos/` → `story[].image` |

## Piezas clave

- `components/ui/melt-shader.tsx` — el shader psicodélico (domain-warp fbm, paleta iridiscente por set, tracers, iridiscencia en crestas). Los dos modos (`psytrance` / `psytech`) se cambian al reservar un set.
- `components/over-emotions/hero-section.tsx` — logo 2026 con filtro SVG de derretido: se solidifica al entrar y se derrite con el scroll; `mix-blend-mode: difference` sobre el shader.
- `components/over-emotions/booking-section.tsx` — el formulario abre el correo del visitante ya redactado (mailto), sin backend.

Calidad de render: se detecta automáticamente. Para probar: `localStorage.setItem("oe-quality", "low" | "medium" | "high")`.
