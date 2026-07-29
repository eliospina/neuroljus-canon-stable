import Head from "next/head";
import SiteLayout from "@/components/SiteLayout";

const commitments = [
  "Prefer calm, screen-light interfaces over visually noisy experiences.",
  "Keep prototype language clear where signals could otherwise be overinterpreted.",
  "Support sensory-friendly controls such as low-stimulus, monochrome, and low-light modes in NL-VISION.",
  "Use clear labels, readable contrast, keyboard-reachable controls, and responsive layouts.",
  "Validate with target users before any pilot or active product use.",
];

const openWork = [
  "Formal WCAG audit.",
  "Testing with caregivers and neurodivergent users.",
  "Consent and assent flows suitable for vulnerable contexts.",
  "Clearer multilingual accessibility review across English, Swedish, and Spanish.",
  "Documented pause criteria for experiences that increase distress or sensory load.",
];

export default function Accessibility() {
  return (
    <SiteLayout>
      <Head>
        <title>Accessibility - Neuroljus</title>
        <meta
          name="description"
          content="Accessibility approach for the Neuroljus research prototype."
        />
      </Head>

      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="nl-kicker">Design ethics</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Accessibility</h1>
        <p className="mt-6 text-base leading-7 text-[color:var(--nl-text-dim)]">
          Neuroljus treats accessibility as part of ethics, not polish. The project is
          especially sensitive to sensory load, caregiver fatigue, multilingual access,
          and the need to keep prototype signals in their proper context.
        </p>

        <section className="mt-9 border-t border-[color:var(--nl-border)] pt-6">
          <h2 className="text-lg font-semibold">Current commitments</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-[color:var(--nl-text-dim)]">
            {commitments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-9 border-t border-[color:var(--nl-border)] pt-6">
          <h2 className="text-lg font-semibold">Before pilot use</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-[color:var(--nl-text-dim)]">
            {openWork.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </SiteLayout>
  );
}
