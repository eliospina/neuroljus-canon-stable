import Head from "next/head";
import Layout from "@/components/Layout";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <Layout>
      <Head>
        <title>Contact — NeuroLjus</title>
        <meta name="description" content="Get in touch with NeuroLjus." />
      </Head>
      <ContactForm />
    </Layout>
  );
}
