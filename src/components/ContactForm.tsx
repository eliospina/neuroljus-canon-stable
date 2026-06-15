import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLang } from "@/lib/language";

const T = {
  es: {
    title: "Contacto",
    intro: "Por favor, no envíes datos clínicos por email. Consulta nuestra",
    privacy: "Política de Privacidad",
    name: "Nombre",
    namePh: "Tu nombre",
    email: "Email",
    message: "Mensaje",
    messagePh: "Cuéntanos un poco sobre tu contexto…",
    consent: "Doy mi consentimiento para ser contactada/o por email. He leído la",
    send: "Enviar mensaje",
    sending: "Enviando…",
    errGeneric: "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
    errNetwork: "Error de red. Inténtalo de nuevo.",
    errConfig: "El formulario no está configurado. Escríbenos a elizabeth@neuroljus.com.",
  },
  en: {
    title: "Contact",
    intro: "Please don't send clinical data by email. See our",
    privacy: "Privacy Policy",
    name: "Name",
    namePh: "Your name",
    email: "Email",
    message: "Message",
    messagePh: "Tell us a bit about your context…",
    consent: "I consent to being contacted by email. I've read the",
    send: "Send message",
    sending: "Sending…",
    errGeneric: "We couldn't send your message. Please try again.",
    errNetwork: "Network error. Please try again.",
    errConfig: "The form is not configured. Please email elizabeth@neuroljus.com.",
  },
  sv: {
    title: "Kontakt",
    intro: "Skicka inte kliniska uppgifter via e-post. Se vår",
    privacy: "Integritetspolicy",
    name: "Namn",
    namePh: "Ditt namn",
    email: "E-post",
    message: "Meddelande",
    messagePh: "Berätta lite om din situation…",
    consent: "Jag samtycker till att kontaktas via e-post. Jag har läst",
    send: "Skicka meddelande",
    sending: "Skickar…",
    errGeneric: "Vi kunde inte skicka ditt meddelande. Försök igen.",
    errNetwork: "Nätverksfel. Försök igen.",
    errConfig: "Formuläret är inte konfigurerat. Mejla elizabeth@neuroljus.com.",
  },
} as const;

export default function ContactForm() {
  const { lang } = useLang();
  const t = T[lang];
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!accessKey) {
      setState("error");
      setMsg(t.errConfig);
      return;
    }

    setState("sending");
    setMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", accessKey);
    formData.append("subject", "NeuroLjus — New contact");
    formData.append("from_name", "NeuroLjus Website");
    formData.append("replyto", (formData.get("email") as string) || "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());

      if (res.success) {
        try {
          form.reset();
        } catch {
          /* no-op */
        }
        if (typeof window !== "undefined") {
          window.location.assign("/thanks");
        } else {
          router.push("/thanks");
        }
        return;
      }
      setState("error");
      setMsg(res.message || t.errGeneric);
    } catch (err: any) {
      setState("error");
      setMsg(err?.message || t.errNetwork);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <h1 className="nl-title" style={{ fontSize: 34 }}>
        {t.title}
      </h1>
      <p className="nl-footer-fine" style={{ marginBottom: 24 }}>
        {t.intro}{" "}
        <Link className="nl-a" href="/privacy">
          {t.privacy}
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="nl-card" noValidate>
        <div className="nl-sr-only" aria-hidden>
          <label>
            Leave this field empty
            <input type="checkbox" name="botcheck" tabIndex={-1} />
          </label>
        </div>

        <div className="nl-field">
          <label className="nl-label" htmlFor="cf-name">
            {t.name}
          </label>
          <input id="cf-name" className="nl-input" name="name" required placeholder={t.namePh} />
        </div>

        <div className="nl-field">
          <label className="nl-label" htmlFor="cf-email">
            {t.email}
          </label>
          <input
            id="cf-email"
            className="nl-input"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="nl-field">
          <label className="nl-label" htmlFor="cf-message">
            {t.message}
          </label>
          <textarea
            id="cf-message"
            className="nl-textarea"
            name="message"
            required
            rows={6}
            placeholder={t.messagePh}
          />
        </div>

        <label className="nl-checkbox-row nl-field">
          <input type="checkbox" required style={{ marginTop: 4 }} />
          <span>
            {t.consent}{" "}
            <Link className="nl-a" href="/privacy">
              {t.privacy}
            </Link>
            .
          </span>
        </label>

        <button type="submit" className="nl-btn nl-btn-primary" disabled={state === "sending"}>
          {state === "sending" ? t.sending : t.send}
        </button>

        {msg && state === "error" && <p className="nl-msg-error">{msg}</p>}
      </form>
    </div>
  );
}
