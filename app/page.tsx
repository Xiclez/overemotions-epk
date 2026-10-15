import { SiteHeader } from "@/components/over-emotions/site-header";
import { IntroOverlay } from "@/components/over-emotions/intro-overlay";
import { HeroSection } from "@/components/over-emotions/hero-section";
import { ArtistStory } from "@/components/over-emotions/artist-story";
import { CredibilitySection } from "@/components/over-emotions/credibility-section";
import { BookableFormats } from "@/components/over-emotions/bookable-formats";
import { MusicLab } from "@/components/over-emotions/music-lab";
import { OfficialVideo } from "@/components/over-emotions/official-video";
import { LiveArchive } from "@/components/over-emotions/live-archive";
import { DownloadVault } from "@/components/over-emotions/download-vault";
import { BookingSection } from "@/components/over-emotions/booking-section";
import { SiteFooter } from "@/components/over-emotions/site-footer";
import { MobileBookingBar } from "@/components/over-emotions/mobile-booking-bar";

/**
 * Section order: impact (hero), who he is (the journey), proof (track record),
 * what you can book (sets), the work (music, video, live), paperwork (vault), the ask.
 */
export default function Home() {
  return (
    <>
      <IntroOverlay />
      <SiteHeader />

      <main id="main">
        <HeroSection />
        <ArtistStory />
        <CredibilitySection />
        <BookableFormats />
        <MusicLab />
        <OfficialVideo />
        <LiveArchive />
        <DownloadVault />
        <BookingSection />
      </main>

      <SiteFooter />
      <MobileBookingBar />
    </>
  );
}
