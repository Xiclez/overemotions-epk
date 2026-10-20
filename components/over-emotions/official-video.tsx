"use client";

/**
 * OfficialVideo — the official music video for the single "Freakers".
 * Static poster tile plus a strip of looping highlight thumbnails; each opens the
 * accessible video modal (MediaPlayer) at its own segment.
 */

import { getText, officialVideo } from "@/data/presskit";
import { SectionHeader } from "@/components/ui/tech-frame";
import { MediaPlayer } from "@/components/ui/media-player";
import { Reveal } from "@/components/ui/reveal";
import { useLocale } from "@/components/over-emotions/frequency-provider";

export function OfficialVideo() {
  const { locale } = useLocale();
  const kicker = getText(officialVideo.kicker, locale);
  const title = getText(officialVideo.title, locale);

  return (
    <section
      id="video"
      aria-labelledby="video-title"
      className="relative border-b border-border py-24 md:py-32"
    >
      <div className="gutter mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader id="video-title" number="06" title={title} kicker={kicker} />
        </Reveal>
        <p className="mt-4 max-w-2xl text-body-md text-bone-dim">
          {getText(officialVideo.description, locale)}
        </p>

        <Reveal className="mt-10 md:mt-16">
          <MediaPlayer
            src={officialVideo.videoSrc}
            poster={officialVideo.poster}
            highlights={officialVideo.highlights.map((h) => ({ ...h, label: getText(h.label, locale) }))}
            posterAlt={officialVideo.posterAlt}
            title={`OVER EMOTIONS — ${title} (${kicker})`}
            kicker={`${kicker} / ${title}`}
          />
        </Reveal>
      </div>
    </section>
  );
}

export default OfficialVideo;
