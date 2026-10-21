import Head from "next/head";
import SiteLayout from "@/components/SiteLayout";

const sections = [
  {
    title: "What this is",
    body:
      "Neuroljus is an independent research project, not a clinical product, a medical device or a care platform. Nothing here diagnoses or treats. This page says exactly what each tool sends, keeps and logs today, so you can decide what to use.",
  },
  {
    title: "The Line (voice support)",
    body:
      "The voice is handled by ElevenLabs. Its agent is set to not record audio, to delete the transcript and any personal data after the call, and to keep nothing (retention 0 days). What you say is turned into text and sent to our server, which asks Claude (Anthropic) for the answer; neither stores the conversation. The server keeps anonymous tags only: language, country, who called (a carer, the person, a child), the topics, which library documents were offered and what the model lacked. It never keeps what you said. Calls are rate-limited by network address; no account and no name are asked.",
  },
  {
    title: "Companion",
    body:
      "The sensory profile, the routines you run and your ratings stay in your browser (localStorage). They are never sent to us. The situation you type or dictate is sent to our server and to Claude to build the routine, together with the most recent NL-VISION reading if there is one, and an anonymous summary of which routine types helped (counts, no text). You can export, import and delete the profile from the page, and clearing the site data in your browser removes everything.",
  },
  {
    title: "Ask",
    body:
      "Your question is sent to our server and to Claude, with the library documents that match it and the same anonymous summary of helpful routines. Questions are not stored. Ideas you save stay in your browser.",
  },
  {
    title: "NL-VISION camera",
    body:
      "Face and hand landmarks are computed in your browser. Video never leaves your device. One aggregated row per second (about 30 minutes) is kept in your browser so the dashboard, Companion and the camera chat can use the latest reading. These are technical signals, not validated indicators of health, emotion, pain or communication. Clearing the site data removes them.",
  },
  {
    title: "Camera chat",
    body:
      "If you use the chat on the camera page, your message, optional notes and the most recent reading are sent to our server and to Claude (or, if you choose it, to NVIDIA's Nemotron). Avoid entering clinical records, identifying data about a child, secrets or emergencies.",
  },
  {
    title: "Contact form",
    body:
      "Messages go through the configured form provider (Web3Forms) to the founder's mailbox. Keep them general; this is not a channel for clinical or personal care data, and we do not handle financial aid or paperwork.",
  },
  {
    title: "Server logs",
    body:
      "Our server logs error names, timings and the anonymous tags described above. It does not log the text of questions, chat messages, situations or calls.",
  },
  {
    title: "Before any pilot",
    body:
      "A pilot with real families or care homes would come with a full privacy policy, consent and assent, a deletion process, retention rules, documentation of the AI processing, accessibility validation and a risk review. We will not run one without those.",
  },
];

export default function Privacy() {
  return (
    <SiteLayout>
      <Head>
        <title>Privacy - Neuroljus</title>
        <meta
          name="description"
          content="What each Neuroljus tool sends, keeps and logs: the Line, Companion, Ask, NL-VISION, the camera chat and the contact form."
        />
      </Head>

      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="nl-kicker">Trust</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-3 text-sm text-[color:var(--nl-text-faint)]">Last updated: 2026-10-21</p>
        <p className="mt-6 text-base leading-7 text-[color:var(--nl-text-dim)]">
          This page describes what the current prototype does with data, tool by tool. It is
          written to be checked against the code, which is public.
        </p>

        <div className="mt-9 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-[color:var(--nl-border)] pt-6">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 leading-7 text-[color:var(--nl-text-dim)]">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="nl-card mt-10 p-6">
          <h2 className="text-lg font-semibold">Medical and emergency care</h2>
          <p className="mt-2 leading-7 text-[color:var(--nl-text-dim)]">
            Medical and emergency situations deserve qualified human response. The Line will
            give you your country&apos;s emergency number first when you ask whom to call. If
            severe pain, injury, distress, abuse or risk is suspected, contact healthcare,
            emergency or safeguarding services.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
