import Head from "next/head";
import Link from "next/link";

const sections = [
  {
    title: "1. Basic entry",
    items: ["Date", "Approximate time", "Observer role", "Setting", "Routine or transition"],
  },
  {
    title: "2. What happened",
    items: [
      "Observed behavior",
      "Duration",
      "What happened immediately before",
      "What happened immediately after",
    ],
  },
  {
    title: "3. Context",
    items: [
      "Light, sound, people nearby, movement or crowding",
      "Expected activity",
      "Recent transition",
      "Change from normal routine",
    ],
  },
  {
    title: "4. Caregiver interpretation",
    items: [
      "What may have been happening",
      "Certainty level: low, medium, or high",
      "Other possible explanations",
      "What uncertainty remains",
    ],
  },
  {
    title: "5. Response and pattern review",
    items: [
      "What the caregiver tried",
      "What seemed to help",
      "What did not help",
      "What to watch for next time",
    ],
  },
];

export default function ObservationMethod() {
  return (
    <>
      <Head>
        <title>Observation Method v0 - Neuroljus</title>
        <meta
          name="description"
          content="A non-diagnostic caregiver observation method for documenting context, uncertainty, and within-person patterns over time."
        />
      </Head>

      <main className="mx-auto max-w-4xl px-5 py-14 text-slate-900">
        <Link href="/" className="text-sm font-semibold text-teal-800 underline">
          Neuroljus
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-normal text-violet-700">
          Observation Method v0
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Better observations first
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          This is a simple, non-diagnostic way to help caregivers document what happened,
          the surrounding context, their interpretation, uncertainty, and what helped.
        </p>

        <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold">Boundary</h2>
          <p className="mt-2 leading-7 text-slate-700">
            This method does not identify pain, emotion, intention, diagnosis, needs, or
            inner states as fact. It is for respectful reflection and pattern review over
            time.
          </p>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-700">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">How to test it</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-slate-700">
            <li>Choose one repeated situation.</li>
            <li>Write three to five entries using the same structure.</li>
            <li>Review only what repeats, what changes, what helps, and what remains uncertain.</li>
            <li>Do not turn one entry into a conclusion.</li>
          </ol>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-950 px-5 font-bold text-white"
          >
            Share feedback
          </Link>
          <Link
            href="/labs/nl-vision"
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-bold text-teal-900"
          >
            Explore NL-VISION
          </Link>
        </div>
      </main>
    </>
  );
}
