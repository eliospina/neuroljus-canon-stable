import Head from "next/head";
import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact — Neuroljus</title>
        <meta name="description" content="Get in touch with Neuroljus." />
      </Head>
      <main className="px-6 py-10 md:py-16">
        <ContactForm />
      </main>
    </>
  );
}
