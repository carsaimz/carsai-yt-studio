import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleOAuthCallback } from "@/lib/youtube/client";
import { toast } from "@/lib/notifications";

export const Route = createFileRoute("/oauth/callback")({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code  = params.get("code");
    const state = params.get("state");
    const err   = params.get("error");

    if (err) {
      setStatus("error");
      setError(err === "access_denied" ? "Acesso negado pelo utilizador." : err);
      return;
    }
    if (!code || !state) {
      setStatus("error");
      setError("Parâmetros OAuth em falta.");
      return;
    }

    handleOAuthCallback(code, state)
      .then(() => {
        setStatus("success");
        toast.success("YouTube conectado com sucesso!");
        setTimeout(() => navigate({ to: "/settings" }), 1500);
      })
      .catch((e: Error) => {
        setStatus("error");
        setError(e.message);
      });
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="max-w-sm text-center px-4">
        {status === "loading" && (
          <>
            <FontAwesomeIcon icon={["fas", "spinner"]} spin size="3x" className="text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">A completar autenticação YouTube…</p>
          </>
        )}
        {status === "success" && (
          <>
            <FontAwesomeIcon icon={["fas", "circle-check"]} size="3x" className="text-success" />
            <p className="mt-4 font-semibold">YouTube conectado!</p>
            <p className="mt-1 text-sm text-muted-foreground">A redirecionar…</p>
          </>
        )}
        {status === "error" && (
          <>
            <FontAwesomeIcon icon={["fas", "circle-xmark"]} size="3x" className="text-destructive" />
            <p className="mt-4 font-semibold">Erro de autenticação</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <button onClick={() => navigate({ to: "/settings" })}
              className="mt-4 text-sm text-primary underline">
              Voltar às Definições
            </button>
          </>
        )}
      </div>
    </div>
  );
}
