import { createFileRoute } from "@tanstack/react-router";
import { Filter, MessageCircle, ThumbsDown, ThumbsUp, Pin, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { comments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Comunidade — Carsai YT Studio" },
      { name: "description", content: "Central unificada de comentários com moderação por IA." },
    ],
  }),
  component: CommunityPage,
});

const sentimentColor = {
  positivo: "bg-success/15 text-success",
  neutro: "bg-muted text-muted-foreground",
  negativo: "bg-destructive/15 text-destructive",
} as const;

const urgencyColor = {
  baixa: "bg-muted text-muted-foreground",
  média: "bg-warning/15 text-warning",
  alta: "bg-destructive/15 text-destructive",
} as const;

function CommunityPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Comunidade"
        description="Comentários de todos os vídeos, classificados por IA."
        actions={
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Filtros
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Não respondidos", value: "84" },
          { label: "Positivos", value: "1,2 mil" },
          { label: "Negativos", value: "42" },
          { label: "Urgência alta", value: "9" },
        ].map((s) => (
          <div key={s.label} className="gradient-panel rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <img src={c.avatar} alt="" className="h-9 w-9 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{c.author}</span>
                  <span className="text-xs text-muted-foreground">em "{c.video}"</span>
                  <span className="text-xs text-muted-foreground">· {c.time}</span>
                </div>
                <p className="mt-1 text-sm">{c.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={cn("border-0", sentimentColor[c.sentiment])}>
                    {c.sentiment}
                  </Badge>
                  <Badge className={cn("border-0", urgencyColor[c.urgency])}>
                    urgência {c.urgency}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Button size="sm" variant="outline">
                <MessageCircle className="mr-1 h-3.5 w-3.5" />
                Responder
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground">
                <Pin className="mr-1 h-3.5 w-3.5" />
                Fixar
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive">
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remover
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto text-primary">
                Sugerir resposta com IA
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
