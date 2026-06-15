import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Web3Forms — tu access key pública
    formData.append("access_key", "5b50cf71-36b1-4445-8d7a-f9a7a98cc4f6");
    // Metadatos
    formData.append("subject", "Neuroljus — New contact");
    formData.append("from_name", "Neuroljus Website");
    formData.append("replyto", (formData.get("email") as string) || "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());

      if (res.success) {
        try { form.reset(); } catch {}
        await new Promise((r) => setTimeout(r, 150)); // opcional
        // Redirección segura
        if (typeof window !== "undefined") {
          window.location.assign("/thanks");
        } else {
          router.push("/thanks");
        }
        return;
      } else {
        setState("error");
        setMsg(res.message || "We couldn’t send your message. Please try again.");
      }
    } catch (err: any) {
      setState("error");
      setMsg(err?.message || "Network error. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4">Contact</h1>
      <p className="text-sm text-gray-600 mb-6">
        SV/EN · Please don’t send clinical data by email. See our{" "}
        <Link href="/privacy" className="underline">Privacy</Link>.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Honeypot anti-spam */}
        <div className="hidden" aria-hidden>
          <label>
            Leave this field empty
            <input type="checkbox" name="botcheck" tabIndex={-1} />
          </label>
        </div>

        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-xl border p-3 outline-none focus:ring"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-xl border p-3 outline-none focus:ring"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            name="message"
            required
            rows={6}
            className="w-full rounded-xl border p-3 outline-none focus:ring"
            placeholder="Tell us a bit about your context (SV/EN/ES)…"
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required className="mt-1" />
          <span>
            I consent to being contacted by email. I’ve read the{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={state === "sending"}
          className="px-5 py-3 rounded-2xl bg-black text-white hover:opacity-90 disabled:opacity-50"
        >
          {state === "sending" ? "Sending…" : "Send message"}
        </button>

        {msg && (
          <p className={`text-sm ${state === "ok" ? "text-green-700" : "text-red-700"}`}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}