import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FirebaseError } from "firebase/app";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { loginEmail, loginGoogle, registerEmail, resetPassword, useFirebaseUser } from "@/lib/firebase/auth";
import { isSetupCompleted } from "@/lib/setup/store";
import { toast, alert } from "@/lib/notifications";
import { useI18n } from "@/lib/i18n";
import { LangPicker } from "@/components/lang-picker";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Carsai YT Studio" },
      { name: "description", content: "Faça login para gerenciar seu canal." },
    ],
  }),
  component: AuthPage,
});

function friendly(e: unknown, t: (k: string) => string) {
  if (e instanceof FirebaseError) {
    const map: Record<string, string> = {
      "auth/invalid-credential": t("auth.invalidCredential"),
      "auth/user-not-found": t("auth.userNotFound"),
      "auth/wrong-password": t("auth.wrongPassword"),
      "auth/email-already-in-use": t("auth.emailInUse"),
      "auth/weak-password": t("auth.weakPassword"),
      "auth/invalid-email": t("auth.invalidEmail"),
      "auth/popup-closed-by-user": t("auth.popupClosed"),
    };
    return map[e.code] ?? e.message;
  }
  return e instanceof Error ? e.message : t("auth.unexpectedError");
}

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const { user, loading } = useFirebaseUser();

  // Already logged in → go to dashboard
  if (!loading && user) {
    return <Navigate to="/" />;
  }

  // Setup not completed → go to wizard
  if (!isSetupCompleted()) {
    return <Navigate to="/welcome" />;
  }

  // Firebase still resolving — show minimal spinner (don't flash login form)
  if (loading) {
    return (
      <div style={{ display:"flex", minHeight:"100vh", alignItems:"center", justifyContent:"center", background:"#1a1410" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid rgba(255,107,53,0.3)", borderTopColor:"#ff6b35", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const id = toast.loading(t(mode === "login" ? "auth.signingIn" : "auth.creating"));
    try {
      if (mode === "login") await loginEmail(email, password);
      else await registerEmail(email, password);
      toast.dismiss(id);
      toast.success(t(mode === "login" ? "auth.welcome" : "auth.created"));
      navigate({ to: "/" });
    } catch (err) {
      toast.dismiss(id);
      toast.error(friendly(err, t));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    const id = toast.loading(t("auth.connecting"));
    try {
      await loginGoogle();
      toast.dismiss(id);
      toast.success(t("auth.welcome"));
      navigate({ to: "/" });
    } catch (err) {
      toast.dismiss(id);
      toast.error(friendly(err, t));
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!email) {
      await alert({ title: "E-mail necessário", text: "Informe seu e-mail antes de redefinir a senha.", icon: "warning" });
      return;
    }
    try {
      await resetPassword(email);
      toast.success("E-mail de recuperação enviado.");
    } catch (err) {
      toast.error(friendly(err, t));
    }
  };

  return (
    <Shell>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {mode === "login" ? t("auth.signIn") : t("auth.signUp")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("auth.subtitle")}
      </p>

      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">
            <FontAwesomeIcon icon={["fas", "right-to-bracket"]} className="mr-1.5" />
            {t("auth.signIn")}
          </TabsTrigger>
          <TabsTrigger value="register">
            <FontAwesomeIcon icon={["fas", "user-plus"]} className="mr-1.5" />
            {t("auth.signUp")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={mode} className="mt-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <FontAwesomeIcon icon={["fas", "envelope"]} className="mr-1.5 text-muted-foreground" />
                {t("auth.emailLabel")}
              </Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">
                <FontAwesomeIcon icon={["fas", "lock"]} className="mr-1.5 text-muted-foreground" />
                {t("auth.passwordLabel")}
              </Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full gradient-brand text-primary-foreground hover:opacity-90">
              {busy
                ? <FontAwesomeIcon icon={["fas", "spinner"]} spin className="mr-2" />
                : <FontAwesomeIcon icon={["fas", mode === "login" ? "right-to-bracket" : "user-plus"]} className="mr-2" />
              }
              {mode === "login" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("auth.or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" onClick={onGoogle} disabled={busy} className="mt-3 w-full">
        <FontAwesomeIcon icon={["fab", "google"]} className="mr-2 text-blue-400" />
        {t("auth.withGoogle")}
      </Button>

      {mode === "login" && (
        <button type="button" onClick={onReset} className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition">
          <FontAwesomeIcon icon={["fas", "key"]} className="mr-1" />
          {t("auth.forgotPassword")}
        </button>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-warning/10 blur-3xl" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl overflow-hidden">
            <img src="/icon-192.png" alt="Carsai" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">Carsai</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">YT Studio</p>
          </div>
          <LangPicker compact className="ml-auto" />
        </div>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("auth.termsPrefix")} <Link to="/terms" className="underline">{t("footer.terms")}</Link> {t("common.and")} <Link to="/privacy" className="underline">{t("footer.privacy")}</Link>.
        </p>
        <nav className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-muted-foreground">
          <Link to="/docs" className="hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "book-open"]} className="mr-1" />{t("nav.docs")}
          </Link>
          <Link to="/help" className="hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "circle-question"]} className="mr-1" />{t("nav.help")}
          </Link>
          <Link to="/about" className="hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "circle-info"]} className="mr-1" />{t("nav.about")}
          </Link>
          <Link to="/changelog" className="hover:text-foreground">
            <FontAwesomeIcon icon={["fas", "clock-rotate-left"]} className="mr-1" />{t("nav.changelog")}
          </Link>
        </nav>
      </div>
    </div>
  );
}
