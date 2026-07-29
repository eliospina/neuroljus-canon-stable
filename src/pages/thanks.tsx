import Head from "next/head";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";

export default function Thanks() {
  return (
    <SiteLayout>
      <Head>
        <title>Thanks — Neuroljus</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="px-6 py-16 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">Tack! / Thanks!</h1>
        <p className="mt-4 text-[color:var(--nl-text-dim)]">
          We received your message and will reply within 1–2 business days.
        </p>
        <Link href="/" className="nl-cta mt-8">
          Back to home
        </Link>
      </div>
    </SiteLayout>
  );
}
