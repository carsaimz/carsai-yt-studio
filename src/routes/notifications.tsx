import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useLS } from "@/lib/storage/kv";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notificações — Carsai YT Studio" }] }),
  component: NotificationsPage,
});

type N = { id: string; title: string; body: string; ts: string; read: boolean; kind: "info" | "success" | "warn" };

function seed(): N[] {
  return [
    { id: "1", title: "Bem-vindo!", body: "Conclua o assistente para liberar todo o potencial.", ts: new Date().toISOString(), read: false, kind: "info" },
  ];
}

function NotificationsPage() {
  const [list, setList] = useLS<N[]>("notifications", seed());
  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-8">
      <PageHeader
        title="Notificações"
        description={`${unread} não ${unread === 1 ? "lida" : "lidas"}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => setList(list.map((n) => ({ ...n, read: true })))}>
            <CheckCheck className="mr-1 h-4 w-4" /> Marcar tudo como lido
          </Button>
        }
      />
      <AnimatePresence>
        {list.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sem notificações por aqui.</p>
          </Card>
        ) : (
          list.map((n) => (
            <motion.div key={n.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className={`flex items-start gap-3 p-4 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{n.title}</p>
                    {!n.read && <Badge variant="secondary">Nova</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(n.ts).toLocaleString("pt-BR")}</p>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
      <p className="text-center text-xs text-muted-foreground">
        Veja <Link to="/changelog" className="text-primary underline">o changelog</Link> para novidades do app.
      </p>
    </div>
  );
}
