"use client";

import React, { useState } from "react";
import {
  Bot, Plus, Play, Trash2, Clock, Zap, Copy, Loader2, Workflow, History, ToggleLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ViewHeader, SectionCard, EmptyState, StatusDot } from "../widgets";
import { useStudioStore } from "@/lib/studio/store";
import { RULE_TEMPLATES, simulateEvent } from "@/lib/studio/automation";
import { useI18n } from "@/lib/studio/i18n";
import { timeAgo, uid } from "@/lib/studio/utils";
import type { Channel, Video, CommentItem, AutomationRule, AutomationTriggerType, AutomationActionType, AutomationAction, AutomationCondition } from "@/lib/studio/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TRIGGERS: { id: AutomationTriggerType; label: string }[] = [
  { id: "on_new_video", label: "Quando um vídeo novo é publicado" },
  { id: "on_new_comment", label: "Quando chega um comentário novo" },
  { id: "on_schedule", label: "Em intervalos programados" },
  { id: "on_milestone", label: "Ao atingir um marco" },
];

const ACTIONS: { id: AutomationActionType; label: string; icon: string }[] = [
  { id: "ai_draft_reply", label: "Rascunhar resposta com IA", icon: "🤖" },
  { id: "generate_ideas", label: "Gerar ideias de conteúdo", icon: "💡" },
  { id: "append_tags", label: "Acrescentar tags", icon: "🏷️" },
  { id: "notify", label: "Notificar-me", icon: "🔔" },
  { id: "webhook", label: "Enviar para webhook", icon: "🌐" },
];

interface DraftRule {
  name: string;
  trigger: AutomationTriggerType;
  intervalHours: number;
  milestoneMetric: "subscribers" | "views" | "videos";
  threshold: number;
  conditionMetric: AutomationCondition["metric"];
  conditionOp: AutomationCondition["op"];
  conditionValue: string;
  actions: AutomationActionType[];
  tags: string;
  webhookUrl: string;
}

const emptyDraft: DraftRule = {
  name: "",
  trigger: "on_new_comment",
  intervalHours: 24,
  milestoneMetric: "subscribers",
  threshold: 50000,
  conditionMetric: "sentiment",
  conditionOp: "contains",
  conditionValue: "",
  actions: ["notify"],
  tags: "2026, youtube",
  webhookUrl: "",
};

export function AutomationView(_props: { channel: Channel; videos: Video[]; comments: CommentItem[] }) {
  const { t } = useI18n();
  const store = useStudioStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<DraftRule>(emptyDraft);
  const [busy, setBusy] = useState<string | null>(null);

  const createRule = () => {
    if (!draft.name.trim()) {
      toast.error(t("automation.newRule"), { description: "Dá um nome à regra" });
      return;
    }
    const actions: AutomationAction[] = draft.actions.map((type) => {
      if (type === "append_tags") return { type, params: { tags: draft.tags } as Record<string, string> };
      if (type === "webhook") return { type, params: { url: draft.webhookUrl } as Record<string, string> };
      return { type };
    });
    const rule: AutomationRule = {
      id: uid(),
      name: draft.name.trim(),
      enabled: true,
      trigger:
        draft.trigger === "on_schedule"
          ? { type: "on_schedule", intervalHours: draft.intervalHours }
          : draft.trigger === "on_milestone"
            ? { type: "on_milestone", metric: draft.milestoneMetric, threshold: draft.threshold }
            : { type: draft.trigger },
      conditions: draft.conditionValue.trim()
        ? [{ metric: draft.conditionMetric, op: draft.conditionOp, value: draft.conditionValue.trim() }]
        : [],
      actions,
      createdAt: new Date().toISOString(),
      runCount: 0,
    };
    store.addRule(rule);
    store.logActivity({ kind: "automation", title: `Regra criada: ${rule.name}` });
    toast.success(t("automation.newRule"), { description: rule.name });
    setDialogOpen(false);
    setDraft(emptyDraft);
  };

  const applyTemplate = (tpl: (typeof RULE_TEMPLATES)[number]) => {
    const base = tpl.make();
    const rule: AutomationRule = { ...base, id: uid(), createdAt: new Date().toISOString(), runCount: 0 };
    store.addRule(rule);
    store.logActivity({ kind: "automation", title: `Modelo aplicado: ${tpl.name}` });
    toast.success(t("automation.templates"), { description: tpl.name });
  };

  const runNow = async (rule: AutomationRule) => {
    setBusy(rule.id);
    try {
      const { runRuleActions } = await import("@/lib/studio/automation");
      await runRuleActions(rule, { kind: rule.trigger.type === "on_new_comment" ? "new_comment" : "new_video" });
      toast.success(t("common.run"), { description: rule.name });
    } finally {
      setBusy(null);
    }
  };

  const triggerLabel = (r: AutomationRule) => {
    if (r.trigger.type === "on_schedule") return `⏰ a cada ${r.trigger.intervalHours}h`;
    if (r.trigger.type === "on_milestone") return `🎯 ${r.trigger.metric} ≥ ${r.trigger.threshold?.toLocaleString()}`;
    return TRIGGERS.find((tr) => tr.id === r.trigger.type)?.label || r.trigger.type;
  };

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t("automation.title")}
        subtitle={t("automation.subtitle")}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={async () => {
                const n1 = await simulateEvent("new_comment");
                const n2 = await simulateEvent("new_video");
                const total = n1 + n2;
                toast.success("Eventos simulados", { description: `${total} ${total === 1 ? "regra acionada" : "regras acionadas"}` });
              }}
            >
              <Play className="h-4 w-4" /> Simular eventos
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-flame text-white gap-1.5">
                  <Plus className="h-4 w-4" /> {t("automation.newRule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> {t("automation.newRule")}</DialogTitle>
                  <DialogDescription>Acionador → condições → ações. Executa localmente neste dispositivo.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="ex.: Responder a fãs" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("automation.trigger")}</label>
                    <Select value={draft.trigger} onValueChange={(v) => setDraft({ ...draft, trigger: v as AutomationTriggerType })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRIGGERS.map((tr) => <SelectItem key={tr.id} value={tr.id}>{tr.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {draft.trigger === "on_schedule" && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">A cada</span>
                        <Input type="number" min={1} max={720} value={draft.intervalHours} onChange={(e) => setDraft({ ...draft, intervalHours: Number(e.target.value) })} className="w-24 h-8" />
                        <span className="text-xs text-muted-foreground">horas</span>
                      </div>
                    )}
                    {draft.trigger === "on_milestone" && (
                      <div className="mt-2 flex items-center gap-2">
                        <Select value={draft.milestoneMetric} onValueChange={(v) => setDraft({ ...draft, milestoneMetric: v as DraftRule["milestoneMetric"] })}>
                          <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subscribers">subscritores</SelectItem>
                            <SelectItem value="views">views de vídeo</SelectItem>
                            <SelectItem value="videos">vídeos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" value={draft.threshold} onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })} className="w-32 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("automation.conditions")}</label>
                    <div className="mt-1.5 flex gap-2">
                      <Select value={draft.conditionMetric} onValueChange={(v) => setDraft({ ...draft, conditionMetric: v as AutomationCondition["metric"] })}>
                        <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sentiment">sentimento</SelectItem>
                          <SelectItem value="keywords">palavras</SelectItem>
                          <SelectItem value="views">views</SelectItem>
                          <SelectItem value="likes">likes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={draft.conditionOp} onValueChange={(v) => setDraft({ ...draft, conditionOp: v as AutomationCondition["op"] })}>
                        <SelectTrigger className="w-20 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">contém</SelectItem>
                          <SelectItem value=">=">≥</SelectItem>
                          <SelectItem value="<=">≤</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={draft.conditionValue} onChange={(e) => setDraft({ ...draft, conditionValue: e.target.value })} placeholder="valor (opcional)" className="h-9" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("automation.actions")}</label>
                    <div className="mt-1.5 space-y-1.5">
                      {ACTIONS.map((a) => {
                        const on = draft.actions.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onClick={() => setDraft({ ...draft, actions: on ? draft.actions.filter((x) => x !== a.id) : [...draft.actions, a.id] })}
                            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${on ? "border-primary/60 bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                          >
                            <span>{a.icon}</span> {a.label}
                            {on && <Check className="ml-auto h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                    {draft.actions.includes("append_tags") && (
                      <Input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="tags separadas por vírgula" className="mt-2" />
                    )}
                    {draft.actions.includes("webhook") && (
                      <Input value={draft.webhookUrl} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} placeholder="https://webhook.site/..." className="mt-2 font-mono text-xs" />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                  <Button onClick={createRule} className="bg-gradient-flame text-white">{t("common.save")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Rules */}
      <div className="grid gap-4">
        {store.rules.map((rule) => (
          <div key={rule.id} className="obsidian-card card-elevated p-4 md:p-5">
            <div className="flex flex-wrap items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-flame text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{rule.name}</h3>
                  {rule.enabled ? (
                    <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/40"><StatusDot ok pulse /> {t("common.enabled")}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">{t("common.disabled")}</Badge>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{triggerLabel(rule)}</span>
                  {rule.conditions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <ToggleLeft className="h-3 w-3" />
                      {rule.conditions.map((c) => `${c.metric} ${c.op} ${c.value}`).join(" & ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1"><History className="h-3 w-3" />{rule.runCount} {t("automation.runs").toLowerCase()}</span>
                  {rule.lastRunAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t("automation.lastRun")}: {timeAgo(rule.lastRunAt, "pt")}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rule.actions.map((a, i) => (
                    <span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px]">
                      {ACTIONS.find((x) => x.id === a.type)?.icon} {ACTIONS.find((x) => x.id === a.type)?.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(v) => { store.updateRule(rule.id, { enabled: v }); toast.success(v ? `${rule.name} ativada` : `${rule.name} pausada`); }}
                  aria-label={rule.name}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void runNow(rule)} disabled={busy === rule.id} aria-label={t("common.run")}>
                  {busy === rule.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => { store.removeRule(rule.id); toast.success("Regra eliminada", { description: rule.name }); }} aria-label={t("common.delete")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {store.rules.length === 0 && (
          <div className="obsidian-card">
            <EmptyState icon={<Bot className="h-6 w-6" />} title={t("common.empty")} hint={t("automation.subtitle")} />
          </div>
        )}
      </div>

      {/* Templates */}
      <SectionCard title={t("automation.templates")} icon={<Copy className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {RULE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              onClick={() => applyTemplate(tpl)}
              className="group rounded-xl border border-border bg-muted/30 p-4 text-left hover:bg-muted/60 hover:ring-focus transition-all"
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-primary" /> {tpl.name}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tpl.description}</p>
              <p className="mt-2.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                + {t("automation.newRule")}
              </p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Activity log */}
      <SectionCard title={t("automation.log")} icon={<History className="h-4 w-4" />} contentClassName="p-0">
        <ul className="max-h-72 divide-y divide-border/60 overflow-y-auto">
          {store.activity.filter((a) => a.kind === "automation").slice(0, 12).map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-4 md:px-5 py-3">
              <StatusDot ok pulse />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium break-anywhere">{a.title}</p>
                {a.detail && <p className="mt-0.5 text-[11px] text-muted-foreground break-anywhere">{a.detail}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{timeAgo(a.at, "pt")}</span>
            </li>
          ))}
          {store.activity.filter((a) => a.kind === "automation").length === 0 && (
            <li><EmptyState icon={<History className="h-5 w-5" />} title={t("common.empty")} /></li>
          )}
        </ul>
      </SectionCard>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
