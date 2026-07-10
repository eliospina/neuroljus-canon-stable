import Head from "next/head";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";

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
    <SiteLayout>
      <Head>
        <title>Observation Method v0 - Neuroljus</title>
        <meta
          name="description"
          content="A caregiver observation method for documenting context, uncertainty, responses, and within-person patterns over time."
        />
      </Head>

      <div className="mx-auto max-w-4xl px-5 py-14">
        <p className="nl-kicker">Observation Method v0</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Care observations that can become knowledge
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--nl-text-dim)]">
          A simple structure for documenting what happened, the surrounding context,
          the caregiver's interpretation, uncertainty, and what helped.
        </p>

        <section className="mt-8 nl-card p-6">
          <h2 className="text-lg font-semibold">Care frame</h2>
          <p className="mt-2 leading-7 text-[color:var(--nl-text-dim)]">
            This method keeps observation, interpretation, and uncertainty separate so
            daily care can become clearer over time. Repeated entries help caregivers,
            families, and future research partners review patterns with more context
            and less noise.
          </p>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="nl-card p-6">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-[color:var(--nl-text-dim)]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-8 nl-card p-6">
          <h2 className="text-lg font-semibold">How to test it</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-[color:var(--nl-text-dim)]">
            <li>Choose one repeated situation.</li>
            <li>Write three to five entries using the same structure.</li>
            <li>Review only what repeats, what changes, what helps, and what remains uncertain.</li>
            <li>Let repeated patterns, context, and professional judgment carry the conclusion.</li>
          </ol>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="nl-cta"
          >
            Share feedback
          </Link>
          <Link
            href="/labs/nl-vision"
            className="nl-cta-ghost"
          >
            Explore NL-VISION
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
