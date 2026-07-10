import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Lang = "sv" | "en" | "es";

type Props = {
  lang?: Lang;
};

export default function ContactForm({ lang = "en" }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const T = useMemo(
    () => ({
      sv: {
        intro:
          "För integritet: håll meddelanden allmänna och undvik kliniska journaler, identifierande barnuppgifter eller akut vårdinformation.",
        privacy: "Integritet",
        name: "Namn",
        namePlaceholder: "Ditt namn",
        email: "E-post",
        emailPlaceholder: "du@exempel.se",
        interest: "Vad är du intresserad av?",
        chooseOne: "Välj ett",
        interests: [
          "Vårdgivarintervju",
          "Feedback om observationsmetoden",
          "NL-VISION-prototyp",
          "Forskningssamarbete",
          "Etik eller tillgänglighet",
          "Allmän förfrågan",
        ],
        interestValues: [
          "Caregiver interview",
          "Observation method feedback",
          "NL-VISION prototype",
          "Research collaboration",
          "Ethics or accessibility",
          "General inquiry",
        ],
        message: "Meddelande",
        messagePlaceholder: "Berätta kort om ditt sammanhang för omsorg, forskning eller samarbete...",
        consentBefore: "Jag samtycker till att bli kontaktad via e-post. Jag har läst ",
        consentAfter: ".",
        privacyPolicy: "Integritetspolicy",
        send: "Skicka meddelande",
        sending: "Skickar…",
        errorDefault: "Vi kunde inte skicka ditt meddelande. Försök igen.",
        networkError: "Nätverksfel. Försök igen.",
      },
      en: {
        intro:
          "For privacy, keep messages general and avoid clinical records, identifying child data, or urgent care information.",
        privacy: "Privacy",
        name: "Name",
        namePlaceholder: "Your name",
        email: "Email",
        emailPlaceholder: "you@example.com",
        interest: "What are you interested in?",
        chooseOne: "Choose one",
        interests: [
          "Caregiver interview",
          "Observation method feedback",
          "NL-VISION prototype",
          "Research collaboration",
          "Ethics or accessibility",
          "General inquiry",
        ],
        interestValues: [
          "Caregiver interview",
          "Observation method feedback",
          "NL-VISION prototype",
          "Research collaboration",
          "Ethics or accessibility",
          "General inquiry",
        ],
        message: "Message",
        messagePlaceholder: "Tell us a bit about your care, research, or collaboration context...",
        consentBefore: "I consent to being contacted by email. I've read the ",
        consentAfter: ".",
        privacyPolicy: "Privacy Policy",
        send: "Send message",
        sending: "Sending…",
        errorDefault: "We couldn't send your message. Please try again.",
        networkError: "Network error. Please try again.",
      },
      es: {
        intro:
          "Por privacidad, mantén los mensajes generales y evita registros clínicos, datos identificables de menores o información de cuidado urgente.",
        privacy: "Privacidad",
        name: "Nombre",
        namePlaceholder: "Tu nombre",
        email: "Correo",
        emailPlaceholder: "tu@ejemplo.com",
        interest: "¿En qué estás interesada/o?",
        chooseOne: "Elige una opción",
        interests: [
          "Entrevista con cuidadora",
          "Feedback del método de observación",
          "Prototipo NL-VISION",
          "Colaboración en investigación",
          "Ética o accesibilidad",
          "Consulta general",
        ],
        interestValues: [
          "Caregiver interview",
          "Observation method feedback",
          "NL-VISION prototype",
          "Research collaboration",
          "Ethics or accessibility",
          "General inquiry",
        ],
        message: "Mensaje",
        messagePlaceholder: "Cuéntanos brevemente tu contexto de cuidado, investigación o colaboración...",
        consentBefore: "Consiento ser contactada/o por correo. He leído la ",
        consentAfter: ".",
        privacyPolicy: "Política de privacidad",
        send: "Enviar mensaje",
        sending: "Enviando…",
        errorDefault: "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
        networkError: "Error de red. Inténtalo de nuevo.",
      },
    }),
    []
  );

  const copy = T[lang];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("access_key", "5b50cf71-36b1-4445-8d7a-f9a7a98cc4f6");
    const interest = (formData.get("interest") as string) || "General inquiry";
    formData.append("subject", `Neuroljus — ${interest}`);
    formData.append("from_name", "Neuroljus Website");
    formData.append("replyto", (formData.get("email") as string) || "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());

      if (res.success) {
        try {
          form.reset();
        } catch {}
        await new Promise((r) => setTimeout(r, 150));
        if (typeof window !== "undefined") {
          window.location.assign("/thanks");
        } else {
          router.push("/thanks");
        }
        return;
      } else {
        setState("error");
        setMsg(res.message || copy.errorDefault);
      }
    } catch (err: unknown) {
      setState("error");
      const message = err instanceof Error ? err.message : copy.networkError;
      setMsg(message || copy.networkError);
    }
  }

  return (
    <div className="form">
      <p className="intro">
        {copy.intro}{" "}
        <Link href="/privacy">{copy.privacy}</Link>.
      </p>

      <form onSubmit={onSubmit} className="fields">
        <div className="hidden" aria-hidden>
          <label>
            Leave this field empty
            <input type="checkbox" name="botcheck" tabIndex={-1} />
          </label>
        </div>

        <label className="field">
          <span>{copy.name}</span>
          <input
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            placeholder={copy.namePlaceholder}
          />
        </label>

        <label className="field">
          <span>{copy.email}</span>
          <input
            type="email"
            name="email"
            required
            maxLength={160}
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
          />
        </label>

        <label className="field">
          <span>{copy.interest}</span>
          <select name="interest" required defaultValue="">
            <option value="" disabled>
              {copy.chooseOne}
            </option>
            {copy.interests.map((label, index) => (
              <option key={copy.interestValues[index]} value={copy.interestValues[index]}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{copy.message}</span>
          <textarea
            name="message"
            required
            rows={6}
            maxLength={3000}
            placeholder={copy.messagePlaceholder}
          />
        </label>

        <label className="consent">
          <input type="checkbox" required />
          <span>
            {copy.consentBefore}
            <Link href="/privacy">{copy.privacyPolicy}</Link>
            {copy.consentAfter}
          </span>
        </label>

        <button type="submit" disabled={state === "sending"} className="submit">
          {state === "sending" ? copy.sending : copy.send}
        </button>

        {msg && <p className={`feedback ${state}`}>{msg}</p>}
      </form>

      <style jsx>{`
        .form {
          display: grid;
          gap: 20px;
        }
        .intro {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #a1a1aa;
        }
        .intro :global(a) {
          color: #3ecf9a;
          font-weight: 700;
          text-decoration: none;
        }
        .fields {
          display: grid;
          gap: 16px;
        }
        .field {
          display: grid;
          gap: 8px;
        }
        .field span {
          font-size: 13px;
          font-weight: 700;
          color: #a1a1aa;
        }
        input,
        select,
        textarea {
          width: 100%;
          min-height: 44px;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          background: #18181b;
          color: #fafafa;
          font: inherit;
          padding: 0 12px;
        }
        textarea {
          min-height: 140px;
          padding-top: 12px;
          resize: vertical;
          line-height: 1.5;
        }
        input:focus,
        select:focus,
        textarea:focus,
        button:focus {
          outline: 2px solid #3ecf9a;
          outline-offset: 2px;
        }
        .consent {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 10px;
          align-items: start;
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.5;
        }
        .consent input {
          min-height: auto;
          width: 16px;
          margin-top: 3px;
          accent-color: #3ecf9a;
        }
        .consent :global(a) {
          color: #3ecf9a;
          font-weight: 700;
          text-decoration: none;
        }
        .submit {
          justify-self: start;
          min-height: 44px;
          padding: 0 24px;
          border: none;
          border-radius: 4px;
          background: #3ecf9a;
          color: #09090b;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }
        .submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .feedback {
          margin: 0;
          font-size: 13px;
        }
        .feedback.error {
          color: #f87171;
        }
        .hidden {
          display: none;
        }
      `}</style>
    </div>
  );
}
