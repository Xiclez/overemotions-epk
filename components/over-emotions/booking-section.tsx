"use client";

/**
 * ============================================================================
 * BOOKING FINALE
 * ============================================================================
 * The headline, every contact route, and an enquiry form. There is no backend:
 * on submit the form validates client-side and opens the visitor's email app
 * with a pre-written message to the booking address (mailto). The confirmation
 * panel echoes what was sent and repeats the address in case no app opened.
 *
 * The "preferred set" field is pre-filled from the site's active mode, so a
 * visitor who clicked "BOOK THIS SET" on a card arrives with it chosen.
 */

import * as React from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  AtSign,
  Mail,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { booking, contact, formats, getText, type Locale } from "@/data/presskit";
import { MaskedHeading } from "@/components/ui/masked-heading";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeltShader } from "@/components/ui/melt-shader";
import { Reveal } from "@/components/ui/reveal";
import {
  useLocale,
  useMode,
  useQuality,
} from "@/components/over-emotions/frequency-provider";
import { duration, ease } from "@/lib/motion";

/* ------------------------------------------------------------ form model --- */

interface FormState {
  name: string;
  company: string;
  city: string;
  date: string;
  eventType: string;
  attendance: string;
  format: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  company: "",
  city: "",
  date: "",
  eventType: "",
  attendance: "",
  format: "",
  message: "",
};

/** Field order drives both the tab order and which error gets focus first. */
const FIELD_ORDER: (keyof FormState)[] = [
  "name",
  "company",
  "city",
  "date",
  "eventType",
  "attendance",
  "format",
  "message",
];

function validate(state: FormState, locale: Locale): FormErrors {
  const errors: FormErrors = {};

  if (state.name.trim().length < 2) {
    errors.name = locale === "en"
      ? "Enter the name of the person booking."
      : "Introduce el nombre de la persona que reserva.";
  }
  if (state.company.trim().length < 2) {
    errors.company = locale === "en"
      ? "Enter the promoter, venue or event name."
      : "Introduce el promotor, la sala o el nombre del evento.";
  }
  if (state.city.trim().length < 2) {
    errors.city = locale === "en"
      ? "Which city is the show in?"
      : "¿En qué ciudad se realizará el show?";
  }
  if (!state.date) {
    errors.date = locale === "en"
      ? "Pick a date, even an approximate one."
      : "Elige una fecha, aunque sea aproximada.";
  } else {
    const picked = new Date(state.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(picked.getTime())) {
      errors.date = locale === "en" ? "That date could not be read." : "No se pudo leer esa fecha.";
    } else if (picked < today) {
      errors.date = locale === "en" ? "The date is in the past." : "La fecha ya pasó.";
    }
  }
  if (!state.eventType) errors.eventType = locale === "en" ? "Choose an event type." : "Elige un tipo de evento.";
  if (!state.attendance) errors.attendance = locale === "en" ? "Choose an expected attendance." : "Elige una asistencia esperada.";
  if (!state.format) errors.format = locale === "en" ? "Choose a preferred format." : "Elige un formato preferido.";
  if (state.message.trim().length < 12) {
    errors.message = locale === "en"
      ? "A sentence or two about the night, minimum."
      : "Una o dos frases sobre la noche, como mínimo.";
  }

  return errors;
}

/* ---------------------------------------------------------------- SECTION --- */

export function BookingSection() {
  const { locale } = useLocale();
  const { mode } = useMode();
  const quality = useQuality();
  const reduced = useReducedMotion();

  // Preselect the format matching the site's current musical mode.
  const suggestedFormat = formats.find((f) => f.mode === mode.id)
    ? getText(formats.find((f) => f.mode === mode.id)?.name, locale)
    : "";

  const [state, setState] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Set<keyof FormState>>(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  /**
   * The format field is DERIVED, not synced. Until the visitor picks one for
   * themselves it simply mirrors whatever musical mode the site is in (clicking
   * "BOOK THIS FORMAT" on a card sets that mode), which avoids an effect that
   * writes state on every mode change.
   */
  const form: FormState = React.useMemo(
    () => ({
      ...state,
      format: touched.has("format") ? state.format : suggestedFormat,
    }),
    [state, touched, suggestedFormat],
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    // Clear a shown error as soon as the visitor starts fixing it.
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Validate on blur, not on keystroke.
  const onBlurField = (key: keyof FormState) => {
    setTouched((prev) => new Set(prev).add(key));
    const all = validate(form, locale);
    if (all[key]) setErrors((prev) => ({ ...prev, [key]: all[key] }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(form, locale);
    setErrors(found);
    setTouched(new Set(FIELD_ORDER));

    const firstBad = FIELD_ORDER.find((key) => found[key]);
    if (firstBad) {
      // Focus management: send the visitor straight to the first problem.
      const el = formRef.current?.querySelector<HTMLElement>(
        `[name="${firstBad}"], #field-${firstBad}`,
      );
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      return;
    }

    // No backend: hand the enquiry to the visitor's email app.
    const lines = [
      `${locale === "en" ? "Name" : "Nombre"}: ${form.name}`,
      `${locale === "en" ? "Company / event" : "Empresa / evento"}: ${form.company}`,
      `${locale === "en" ? "City" : "Ciudad"}: ${form.city}`,
      `${locale === "en" ? "Date" : "Fecha"}: ${form.date}`,
      `${locale === "en" ? "Event type" : "Tipo de evento"}: ${form.eventType}`,
      `${locale === "en" ? "Attendance" : "Asistencia"}: ${form.attendance}`,
      `Set: ${form.format}`,
      "",
      form.message,
    ];
    const subject = `Booking — ${form.company || form.name} — ${form.date}`;
    window.location.href = `mailto:${contact.bookingEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    setSubmitted(true);
  };

  const reset = () => {
    setState(EMPTY_FORM);
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
  };

  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="relative isolate overflow-hidden border-b border-border py-24 md:py-32"
    >
      {/* Mode wash behind the finale */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(70% 55% at 50% 0%, ${mode.tint} 0%, transparent 70%)`,
          transition: "background 640ms var(--ease-out-industrial)",
        }}
      />

      <div className="gutter mx-auto max-w-7xl">
        {/* ================================================== THE HEADLINE == */}
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center md:gap-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <span className="label text-label-xs text-acid tabular-nums">
                09
              </span>
              <span aria-hidden="true" className="h-px w-12 bg-border-strong" />
              <span className="label text-label-xs text-gray">{locale === "en" ? "BOOKING" : "RESERVAS"}</span>
            </div>

            <MaskedHeading
              as="h2"
              lines={[getText(booking.headline.line1, locale), getText(booking.headline.line2, locale)]}
              className="text-display-md text-bone uppercase"
              lineClassName=""
            />
            <span id="booking-title" className="sr-only">
              {getText(booking.headline.line1, locale)} {getText(booking.headline.line2, locale)}
            </span>

            <Reveal delay={0.1}>
              <p className="max-w-xl text-body-md text-bone-dim md:text-body-lg">
                {getText(booking.intro, locale)}
              </p>
            </Reveal>

            {/* Contact routes — one primary, the rest equal-weight secondaries */}
            <Reveal delay={0.15}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 xs:flex-row">
                  <MagneticButton variant="primary" size="lg" asChild>
                    <a href={`mailto:${contact.bookingEmail}`}>
                      <Mail className="size-4" aria-hidden="true" />
                      {getText(booking.primaryCta, locale)}
                    </a>
                  </MagneticButton>
                  <Button variant="outline" size="lg" asChild>
                    <a href="#vault">
                      <Download className="size-4" aria-hidden="true" />
                      {getText(booking.secondaryCta, locale)}
                    </a>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="plate" asChild>
                    <a href={`mailto:${contact.bookingEmail}`}>
                      <Mail className="size-4" aria-hidden="true" />
                      {locale === "en" ? "EMAIL" : "CORREO"}
                    </a>
                  </Button>
                  <Button variant="plate" asChild>
                    <a
                      href={contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AtSign className="size-4" aria-hidden="true" />
                      {locale === "en" ? "INSTAGRAM" : "INSTAGRAM"}
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>

          {/* The portal: the hero melt returns, framed as a circle */}
          <div className="relative aspect-square w-full max-w-md justify-self-center md:justify-self-end">
            <div className="absolute inset-0 overflow-hidden rounded-full border border-border-strong">
              <MeltShader
                mode={mode.id}
                speed={mode.shader.speed * 0.8}
                intensity={mode.shader.intensity}
                mouseInfluence={0}
                centerDim={0}
                quality={quality === "high" ? "medium" : quality}
                paused={Boolean(reduced)}
                className="h-full w-full"
              />
              {/* Cut-out portrait over the melt; fades out toward the rim */}
              <Image
                src="/media/pics/over-footer.png"
                alt={locale === "en" ? "Over Emotions portrait" : "Retrato de Over Emotions"}
                fill
                sizes="(max-width: 768px) 90vw, 28rem"
                className="object-cover object-[50%_18%] select-none"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, #000 0%, #000 62%, transparent 92%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 0%, #000 62%, transparent 92%)",
                }}
                draggable={false}
              />
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-full border border-bone/10"
            />
          </div>
        </div>

        {/* ===================================================== THE FORM === */}
        <div className="mt-16 border border-border bg-charcoal/50 md:mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h3 className="label text-label-sm text-bone">{locale === "en" ? "ENQUIRY FORM" : "FORMULARIO DE CONSULTA"}</h3>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="confirmation"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.normal, ease: ease.out }}
                className="p-6 md:p-10"
              >
                {/* Announced to screen readers without stealing focus */}
                <div
                  role="status"
                  aria-live="polite"
                  className="flex max-w-2xl flex-col gap-5"
                >
                  <CheckCircle2
                    className="size-8 text-acid"
                    aria-hidden="true"
                  />
                  <h4 className="font-display text-display-sm text-bone uppercase">
                    {getText(booking.confirmationTitle, locale)}
                  </h4>


                  <p className="text-body-md text-bone-dim">
                    {getText(booking.confirmationBody, locale)}
                  </p>

                  {/* Echo of what went into the email */}
                  <dl className="grid gap-px border border-border bg-border sm:grid-cols-2">
                    {(
                      [
                        ["NAME", form.name],
                        ["COMPANY / EVENT", form.company],
                        ["CITY", form.city],
                        ["DATE", form.date],
                        ["EVENT TYPE", form.eventType],
                        ["ATTENDANCE", form.attendance],
                        ["SET", form.format],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="flex flex-col gap-1 bg-void p-4">
                        <dt className="label text-label-xs text-gray">{locale === "en" ? label : label === "NAME" ? "NOMBRE" : label === "COMPANY / EVENT" ? "EMPRESA / EVENTO" : label === "CITY" ? "CIUDAD" : label === "DATE" ? "FECHA" : label === "EVENT TYPE" ? "TIPO DE EVENTO" : label === "ATTENDANCE" ? "ASISTENCIA" : label === "SET" ? "SET" : "MENSAJE"}</dt>
                        <dd className="text-body-sm text-bone">{value || "—"}</dd>
                      </div>
                    ))}
                    <div className="flex flex-col gap-1 bg-void p-4 sm:col-span-2">
                      <dt className="label text-label-xs text-gray">{locale === "en" ? "MESSAGE" : "MENSAJE"}</dt>
                      <dd className="text-body-sm text-bone">
                        {form.message || "—"}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-3 xs:flex-row">
                    <Button variant="outline" onClick={reset}>
                      <RotateCcw className="size-4" aria-hidden="true" />
                      {locale === "en" ? "SEND ANOTHER" : "ENVIAR OTRO"}
                    </Button>
                    <Button variant="primary" asChild>
                      <a href={`mailto:${contact.bookingEmail}`}>
                        <Mail className="size-4" aria-hidden="true" />
                        {contact.bookingEmail}
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={onSubmit}
                noValidate
                initial={reduced ? { opacity: 0 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast }}
                className="grid gap-6 p-5 md:grid-cols-2 md:p-8"
              >
                <Field
                  label={locale === "en" ? "NAME" : "NOMBRE"}
                  htmlFor="field-name"
                  required
                  error={touched.has("name") ? errors.name : undefined}
                >
                  <Input
                    id="field-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    onBlur={() => onBlurField("name")}
                    aria-required="true"
                    aria-invalid={Boolean(touched.has("name") && errors.name)}
                    aria-describedby={errors.name ? "field-name-error" : undefined}
                    placeholder={locale === "en" ? "Your name" : "Tu nombre"}
                  />
                </Field>

                <Field
                  label={locale === "en" ? "COMPANY / EVENT" : "EMPRESA / EVENTO"}
                  htmlFor="field-company"
                  required
                  error={touched.has("company") ? errors.company : undefined}
                >
                  <Input
                    id="field-company"
                    name="company"
                    autoComplete="organization"
                    value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                    onBlur={() => onBlurField("company")}
                    aria-required="true"
                    aria-invalid={Boolean(
                      touched.has("company") && errors.company,
                    )}
                    placeholder={locale === "en" ? "Promoter, venue or festival" : "Promotor, sala o festival"}
                  />
                </Field>

                <Field
                  label={locale === "en" ? "CITY" : "CIUDAD"}
                  htmlFor="field-city"
                  required
                  error={touched.has("city") ? errors.city : undefined}
                >
                  <Input
                    id="field-city"
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    onBlur={() => onBlurField("city")}
                    aria-required="true"
                    aria-invalid={Boolean(touched.has("city") && errors.city)}
                    placeholder={locale === "en" ? "City" : "Ciudad"}
                  />
                </Field>

                <Field
                  label={locale === "en" ? "DATE" : "FECHA"}
                  htmlFor="field-date"
                  required
                  hint={locale === "en" ? "Approximate is fine." : "La aproximación vale."}
                  error={touched.has("date") ? errors.date : undefined}
                >
                  <Input
                    id="field-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                    onBlur={() => onBlurField("date")}
                    aria-required="true"
                    aria-invalid={Boolean(touched.has("date") && errors.date)}
                    className="[color-scheme:dark]"
                  />
                </Field>

                <Field
                  label={locale === "en" ? "EVENT TYPE" : "TIPO DE EVENTO"}
                  htmlFor="field-eventType"
                  required
                  error={touched.has("eventType") ? errors.eventType : undefined}
                >
                  <Select
                    value={form.eventType}
                    onValueChange={(v) => {
                      setField("eventType", v);
                      setTouched((prev) => new Set(prev).add("eventType"));
                    }}
                  >
                    <SelectTrigger
                      id="field-eventType"
                      aria-required="true"
                      aria-invalid={Boolean(
                        touched.has("eventType") && errors.eventType,
                      )}
                    >
                      <SelectValue placeholder={locale === "en" ? "SELECT EVENT TYPE" : "ELIGE TIPO DE EVENTO"} />
                    </SelectTrigger>
                    <SelectContent>
                      {booking.eventTypes.map((type) => (
                        <SelectItem key={getText(type, locale)} value={getText(type, locale)}>
                          {getText(type, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label={locale === "en" ? "EXPECTED ATTENDANCE" : "ASISTENCIA ESPERADA"}
                  htmlFor="field-attendance"
                  required
                  error={
                    touched.has("attendance") ? errors.attendance : undefined
                  }
                >
                  <Select
                    value={form.attendance}
                    onValueChange={(v) => {
                      setField("attendance", v);
                      setTouched((prev) => new Set(prev).add("attendance"));
                    }}
                  >
                    <SelectTrigger
                      id="field-attendance"
                      aria-required="true"
                      aria-invalid={Boolean(
                        touched.has("attendance") && errors.attendance,
                      )}
                    >
                      <SelectValue placeholder={locale === "en" ? "SELECT CAPACITY BAND" : "ELIGE RANGO DE AFORO"} />
                    </SelectTrigger>
                    <SelectContent>
                      {booking.attendanceBands.map((band) => (
                        <SelectItem key={getText(band, locale)} value={getText(band, locale)}>
                          {getText(band, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label={locale === "en" ? "PREFERRED SET" : "SET PREFERIDO"}
                  htmlFor="field-format"
                  required
                  hint={locale === "en" ? "Pre-filled from the frequency you selected above." : "Rellenado automáticamente desde la frecuencia que elegiste arriba."}
                  error={touched.has("format") ? errors.format : undefined}
                  className="md:col-span-2"
                >
                  <Select
                    value={form.format}
                    onValueChange={(v) => {
                      setField("format", v);
                      setTouched((prev) => new Set(prev).add("format"));
                    }}
                  >
                    <SelectTrigger
                      id="field-format"
                      aria-required="true"
                      aria-invalid={Boolean(
                        touched.has("format") && errors.format,
                      )}
                    >
                      <SelectValue placeholder={locale === "en" ? "SELECT A SET" : "ELIGE UN SET"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((f) => (
                        <SelectItem key={f.id} value={getText(f.name, locale)}>
                          {getText(f.name, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label={locale === "en" ? "MESSAGE" : "MENSAJE"}
                  htmlFor="field-message"
                  required
                  hint={locale === "en" ? "Room, capacity, slot time, budget range." : "Sala, aforo, horario, rango de presupuesto."}
                  error={touched.has("message") ? errors.message : undefined}
                  className="md:col-span-2"
                >
                  <Textarea
                    id="field-message"
                    name="message"
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    onBlur={() => onBlurField("message")}
                    aria-required="true"
                    aria-invalid={Boolean(
                      touched.has("message") && errors.message,
                    )}
                    placeholder={locale === "en" ? "Tell us about the night." : "Cuéntanos sobre la noche."}
                  />
                </Field>

                <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {locale === "en" ? "WRITE EMAIL" : "REDACTAR CORREO"}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default BookingSection;
