import Head from "next/head";
import Link from "next/link";

export default function Thanks() {
  return (
    <>
      <Head>
        <title>Thanks — Neuroljus</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="px-6 py-16 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">Tack! / Thanks!</h1>
        <p className="mt-4 text-gray-600">
          We received your message and will reply within 1–2 business days.
        </p>
        <Link href="/" className="inline-block mt-8 px-5 py-3 rounded-2xl bg-black text-white">
          Back to home
        </Link>
      </main>
    </>
  );
}
