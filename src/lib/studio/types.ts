/** Carsai YT Studio v3 — domain model */

export type Lang = "pt" | "en" | "es" | "fr" | "de" | "it";
export type ThemeMode = "dark" | "light" | "system";
export type DataMode = "demo" | "live";

/** Accent palettes for the Obsidian theme */
export type AccentId = "flame" | "orchid" | "ocean" | "volt";

/** Chart visualisation types */
export type ChartType = "line" | "area" | "bar" | "pie" | "radar" | "3d";

export type VideoVisibility = "public" | "unlisted" | "private";

export interface Channel {
  id: string;
  title: string;
  handle: string;
  avatarSeed: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  country: string;
  createdAt: string;
  keywords: string[];
  description: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailSeed: string;
  publishedAt: string;
  durationSec: number;
  views: number;
  likes: number;
  comments: number;
  visibility: VideoVisibility;
  tags: string[];
  category: string;
  ctr: number; // click-through rate 0..1
  avgViewPercent: number; // 0..1
  watchHours: number;
  chapters?: VideoChapter[];
}

export interface VideoChapter {
  time: string;
  label: string;
}

export interface CommentItem {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  authorSeed: string;
  text: string;
  publishedAt: string;
  likes: number;
  state: "published" | "heldForReview" | "likelySpam";
  replied?: boolean;
  sentiment: "positive" | "neutral" | "negative" | "question";
}

export interface TimeSeriesPoint {
  date: string; // ISO date
  views: number;
  watchHours: number;
  subscribersGained: number;
  ctr: number;
  avgViewPercent: number;
}

export interface TrafficSource {
  source: string;
  viewsPct: number;
}

export interface RetentionPoint {
  pct: number; // 0..100 timeline position
  value: number; // 0..100 viewers remaining
}

export interface TopItem {
  label: string;
  value: number;
}

export interface Kpi {
  key: string;
  label: string;
  value: number;
  deltaPct: number;
  format: "compact" | "hours" | "percent" | "count";
  spark: number[];
}

/* ---------- Goals ---------- */

export interface Goal {
  id: string;
  metric: "subscribers" | "views" | "watchHours" | "videos";
  target: number;
  label: string;
  createdAt: string;
}

/* ---------- Automation ---------- */

export type AutomationTriggerType =
  | "on_new_video"
  | "on_new_comment"
  | "on_schedule"
  | "on_milestone";

export interface AutomationTrigger {
  type: AutomationTriggerType;
  /** every N hours for schedule */
  intervalHours?: number;
  /** milestone metric */
  metric?: "subscribers" | "views" | "videos";
  threshold?: number;
}

export type AutomationActionType =
  | "ai_draft_reply"
  | "generate_ideas"
  | "append_tags"
  | "notify"
  | "webhook";

export interface AutomationAction {
  type: AutomationActionType;
  params?: Record<string, string>;
}

export interface AutomationCondition {
  metric: "views" | "likes" | "sentiment" | "keywords";
  op: ">=" | "<=" | "contains";
  value: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  lastRunAt?: string;
  runCount: number;
}

export interface ActivityEntry {
  id: string;
  at: string;
  kind: "automation" | "ai" | "seo" | "system" | "community" | "youtube";
  title: string;
  detail?: string;
}

/* ---------- Integrations ---------- */

export type IntegrationId =
  | "youtube"
  | "gemini"
  | "groq"
  | "openrouter"
  | "openai"
  | "anthropic"
  | "huggingface"
  | "mistral"
  | "deepseek"
  | "together"
  | "ollama"
  | "lmstudio"
  | "pexels"
  | "unsplash"
  | "pixabay"
  | "webhook";

export interface IntegrationMeta {
  id: IntegrationId;
  name: string;
  category: "platform" | "ai" | "media" | "automation";
  free: string;
  docsUrl: string;
  keyless?: boolean;
  description: string;
  keyHint?: string;
}

/* ---------- AI providers ---------- */

/** Any provider id: built-in registry ids or `custom:<uid>` */
export type AiProvider = string;

export type ProviderKind = "openai-compatible" | "gemini" | "anthropic";

export interface CustomProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  key: string;
  local: boolean;
  createdAt: string;
}

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
  at: string;
}

/* ---------- Google OAuth ---------- */

export interface GoogleAuth {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken?: string;
  /** epoch ms when the access token expires */
  expiresAt: number;
  scope: string;
  email?: string;
  connectedAt: string;
}

/* ---------- Views / navigation ---------- */

export type StudioView =
  | "dashboard"
  | "analytics"
  | "content"
  | "video"
  | "youtube"
  | "seo"
  | "community"
  | "ai"
  | "automation"
  | "integrations"
  | "tools"
  | "settings";

export interface StudioStateView {
  view: StudioView;
  videoId?: string;
  tool?: "thumbnail" | "trending" | "planner" | "keywords" | "export";
}
