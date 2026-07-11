import Head from "next/head";
import SiteLayout from "@/components/SiteLayout";
import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  return (
    <SiteLayout>
      <Head>
        <title>Contact — Neuroljus</title>
        <meta
          name="description"
          content="Contact Neuroljus about research, collaboration, ethics, accessibility, and privacy-first caregiver observation."
        />
      </Head>
      <div className="px-6 py-10 md:py-16">
        <ContactForm />
      </div>
    </SiteLayout>
  );
}
