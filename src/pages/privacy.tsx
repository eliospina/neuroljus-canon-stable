import Head from "next/head";
import Link from "next/link";

const sections = [
  {
    title: "Prototype status",
    body:
      "Neuroljus is a paused research and portfolio prototype. It is not a clinical product, diagnostic tool, medical device, institutional platform, or production care app.",
  },
  {
    title: "NL-VISION camera metrics",
    body:
      "The NL-VISION demo is designed to process camera-derived face and hand metrics in the browser. Prototype metrics may be stored in your browser localStorage so the demo dashboard and chat can use the most recent observations. These metrics are not validated health, emotion, pain, or communication indicators.",
  },
  {
    title: "AI chat",
    body:
      "If you use the Neuroljus AI chat, your chat message, optional caregiver notes, and the most recent prototype metrics may be sent to the server-side chat endpoint and then to OpenAI for a response. Do not enter clinical records, identifying child data, secrets, or emergency information.",
  },
  {
    title: "Contact form",
    body:
      "The contact form is for collaboration and general project communication. Messages are submitted through the configured form provider. Please do not send sensitive clinical, diagnostic, or personal care data through the form.",
  },
  {
    title: "Before any pilot",
    body:
      "Before any pilot or active product use, Neuroljus needs a full privacy policy, consent and assent model, deletion process, data retention rules, AI-processing documentation, accessibility validation, and risk review.",
  },
];

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy - Neuroljus</title>
        <meta
          name="description"
          content="Prototype privacy approach for Neuroljus, NL-VISION, AI chat, and contact messages."
        />
      </Head>

      <main className="mx-auto max-w-3xl px-5 py-14 text-slate-900">
        <Link href="/" className="text-sm font-semibold text-teal-800 underline">
          Neuroljus
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: 2026-07-04</p>
        <p className="mt-6 text-base leading-7 text-slate-700">
          This page describes the current prototype privacy approach. It is a project
          statement, not a complete legal privacy policy for a deployed care product.
        </p>

        <div className="mt-9 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 leading-7 text-slate-700">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold">Emergency and medical boundary</h2>
          <p className="mt-2 leading-7 text-slate-700">
            Neuroljus does not provide emergency support, medical advice, diagnosis, or
            certainty about a person's inner state. If severe pain, injury, distress,
            abuse, or risk is suspected, contact appropriate healthcare, emergency, or
            safeguarding services.
          </p>
        </section>
      </main>
    </>
  );
}
