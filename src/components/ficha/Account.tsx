import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { FichaLang } from "@/lib/ficha/model";
import { readFichas } from "@/lib/ficha/localStore";
import { accountsAvailable, getSupabase, pullFichas, pushAll, startSync } from "@/lib/ficha/sync";

/**
 * The carer's account: email and a sign-in link, no password. While signed in,
 * every ficha saved in this browser also reaches the account, and the account's
 * fichas are pulled into this browser. One hook, used by every page that reads
 * or writes a ficha, so sync is on wherever it matters.
 */

type State = { ready: boolean; session: Session | null; syncing: boolean; error: string | null };

const T: Record<FichaLang, { title: string; why: string; email: string; send: string; sent: string; signedIn: (email: string) => string; out: string; synced: string; unavailable: string; error: string }> = {
  es: {
    title: "Tu cuenta",
    why: "Con una cuenta, la ficha viaja contigo: el teléfono, el ordenador del boende, cualquier navegador. Sin cuenta se queda solo aquí.",
    email: "Tu correo",
    send: "Enviarme un enlace para entrar",
    sent: "Enlace enviado. Ábrelo desde tu correo y vuelves aquí ya dentro.",
    signedIn: (email) => `Dentro como ${email}.`,
    out: "Salir",
    synced: "Las fichas de este navegador se guardan en tu cuenta, cifradas, en la Unión Europea.",
    unavailable: "Las cuentas todavía no están activadas en este sitio.",
    error: "No se pudo. Inténtalo otra vez.",
  },
  en: {
    title: "Your account",
    why: "With an account the profile travels with you: your phone, the care home's computer, any browser. Without one it stays only here.",
    email: "Your email",
    send: "Send me a sign-in link",
    sent: "Link sent. Open it from your email and you come back here signed in.",
    signedIn: (email) => `Signed in as ${email}.`,
    out: "Sign out",
    synced: "The profiles in this browser are saved to your account, encrypted, in the European Union.",
    unavailable: "Accounts are not enabled on this site yet.",
    error: "That did not work. Try again.",
  },
  sv: {
    title: "Ditt konto",
    why: "Med ett konto följer profilen med dig: telefonen, boendets dator, vilken webbläsare som helst. Utan konto stannar den bara här.",
    email: "Din e-post",
    send: "Skicka en inloggningslänk",
    sent: "Länk skickad. Öppna den från din e-post så kommer du tillbaka hit inloggad.",
    signedIn: (email) => `Inloggad som ${email}.`,
    out: "Logga ut",
    synced: "Profilerna i den här webbläsaren sparas i ditt konto, krypterade, inom EU.",
    unavailable: "Konton är inte aktiverade på den här webbplatsen ännu.",
    error: "Det gick inte. Försök igen.",
  },
};

/** Session state plus sync. `onPulled` fires after the account's fichas were merged into this browser. */
export function useAccount(onPulled?: () => void): State & { signIn: (email: string) => Promise<boolean>; signOut: () => Promise<void> } {
  const [state, setState] = useState<State>({ ready: false, session: null, syncing: false, error: null });

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setState((s) => ({ ...s, ready: true }));
      return;
    }
    let stop: (() => void) | null = null;
    const apply = async (session: Session | null) => {
      stop?.();
      stop = null;
      setState((s) => ({ ...s, ready: true, session, error: null }));
      if (!session) return;
      setState((s) => ({ ...s, syncing: true }));
      try {
        const local = readFichas();
        await pushAll(sb, local);
        await pullFichas(sb);
        stop = startSync(sb, () => setState((s) => ({ ...s, error: "sync" })));
        onPulled?.();
      } catch {
        setState((s) => ({ ...s, error: "sync" }));
      } finally {
        setState((s) => ({ ...s, syncing: false }));
      }
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") apply(session);
    });
    return () => {
      sub.subscription.unsubscribe();
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string) => {
    const sb = getSupabase();
    if (!sb) return false;
    const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/ficha` } });
    if (error) setState((s) => ({ ...s, error: "signin" }));
    return !error;
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
  };

  return { ...state, signIn, signOut };
}

export default function AccountPanel({ lang, account }: { lang: FichaLang; account: ReturnType<typeof useAccount> }) {
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  if (!accountsAvailable()) return null;
  if (!account.ready) return null;

  return (
    <section className="account" aria-label={t.title}>
      <h2>{t.title}</h2>
      {account.session ? (
        <>
          <p>
            {t.signedIn(account.session.user.email ?? "")}{" "}
            <button type="button" className="link" onClick={account.signOut}>
              {t.out}
            </button>
          </p>
          <p className="note">{account.syncing ? "…" : t.synced}</p>
        </>
      ) : sent ? (
        <p>{t.sent}</p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await account.signIn(email)) setSent(true);
          }}
        >
          <p className="note">{t.why}</p>
          <div className="row">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} autoComplete="email" />
            <button type="submit" className="nl-cta-ghost">
              {t.send}
            </button>
          </div>
        </form>
      )}
      {account.error && <p className="err">{t.error}</p>}
      <style jsx>{`
        .account {
          margin: 28px 0 0;
          padding: 18px;
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
        }
        h2 {
          margin: 0 0 8px;
          font-size: 16px;
        }
        p {
          margin: 0;
          line-height: 1.5;
        }
        .note {
          color: var(--nl-text-dim);
          font-size: 14px;
          margin-bottom: 10px;
        }
        .row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        input {
          flex: 1;
          min-width: 200px;
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid var(--nl-border-strong);
          border-radius: 10px;
          background: var(--nl-bg-raised);
          color: var(--nl-text);
          font-size: 16px;
        }
        .link {
          border: none;
          background: none;
          color: var(--nl-aurora-a);
          cursor: pointer;
          font: inherit;
          text-decoration: underline;
        }
        .err {
          margin-top: 8px;
          color: #ffb4b4;
          font-size: 14px;
        }
      `}</style>
    </section>
  );
}
