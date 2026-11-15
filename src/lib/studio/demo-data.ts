import type {
  Channel,
  Video,
  CommentItem,
  TimeSeriesPoint,
  TrafficSource,
  RetentionPoint,
  AutomationRule,
  ActivityEntry,
  Kpi,
} from "./types";

/* Deterministic pseudo-random so the demo data is stable across reloads */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const VIDEO_TITLES: [string, number][] = [
  ["Como Montar um PC Gaming em 2026 — Guia Completo para Iniciantes", 1024],
  ["Testei 7 Editores de Vídeo Gratuitos — O Melhor Vai Surpreender-te", 890],
  ["10 Atalhos do CapCut que Vão Acelerar as Tuas Edits", 745],
  ["Miei um Setup Completo com 500€ — Vale a Pena?", 655],
  ["O Erro que 90% dos Criadores Cometem ao Iniciar no YouTube", 545],
  ["ChatGPT vs Gemini para Criadores de Conteúdo — Teste Honesto", 498],
  ["Como Gravei um Documentário com um Telemóvel", 452],
  ["A Verdade sobre Monetização no YouTube em 2026", 421],
  ["Organiza o Teu Canal em 15 Minutos (Método que Uso)", 388],
  ["React para Criadores: Automatiza os Teus Relatórios", 350],
  ["Unboxing do Telemóvel que Filma em 8K — Vale os 1200€?", 332],
  ["Como Fiz 100K Views com Vídeos de 60 Segundos", 301],
  ["Setup de Iluminação Barato que Parece Cinema", 271],
  ["Roteiro Perfeito: A Estrutura que Multiplica Retenção", 246],
];

function makeVideos(): Video[] {
  const r = rng(42);
  const now = Date.now();
  const tagsPool = [
    "tech", "tutorial", "youtube tips", "edição", "capcut", "pc gaming", "setup",
    "inteligência artificial", "monetização", "roteiro", "review", "telemóvel",
    "iluminação", "produtividade", "react",
  ];
  return VIDEO_TITLES.map(([title, daysAgo], i) => {
    const publishedAt = new Date(now - daysAgo * 86400000 - Math.floor(r() * 8) * 3600000).toISOString();
    const views = Math.floor(4500 + r() * 68000 * (1 + i * 0.06));
    const likes = Math.floor(views * (0.035 + r() * 0.035));
    const comments = Math.floor(likes * (0.08 + r() * 0.14));
    const duration = 420 + Math.floor(r() * 900);
    const tags: string[] = [];
    for (let k = 0; k < 4; k++) tags.push(tagsPool[Math.floor(r() * tagsPool.length)]);
    const chapters = duration > 600
      ? [
          { time: "00:00", label: "Introdução" },
          { time: "01:24", label: "Contexto e material" },
          { time: `0${Math.floor(duration / 600)}:${String(Math.floor((duration % 600) / 60)).padStart(2, "0")}`, label: "Passo a passo" },
          { time: `${Math.floor(duration / 60) - 2}:10`, label: "Resultados" },
        ]
      : undefined;
    return {
      id: `demo-v${String(i + 1).padStart(3, "0")}`,
      title,
      description:
        `${title}\n\nNeste vídeo mostro tudo passo a passo, com links e recursos na descrição.\n\n⏱️ Capítulos:\n00:00 Introdução\n01:24 Contexto\n\n#youtube #tech #tutorial`,
      thumbnailSeed: `thumb-${i}-${title.length}`,
      publishedAt,
      durationSec: duration,
      views,
      likes,
      comments,
      visibility: i === 12 ? "private" : i === 10 ? "unlisted" : "public",
      tags: Array.from(new Set(tags)),
      category: i % 3 === 0 ? "Ciência e tecnologia" : i % 3 === 1 ? "Educação" : "Como fazer e estilo",
      ctr: 0.038 + r() * 0.062,
      avgViewPercent: 0.32 + r() * 0.33,
      watchHours: Math.floor((views * duration) / 3600 * (0.35 + r() * 0.2)),
      chapters,
    } satisfies Video;
  });
}

const videos = makeVideos();

export const demoChannel: Channel = {
  id: "UC_demo_carsai",
  title: "Carsai Tech",
  handle: "@carsaimz",
  avatarSeed: "carsai-tech",
  subscribers: 48250,
  totalViews: 6120000,
  totalVideos: 128,
  country: "MZ",
  createdAt: "2022-03-14T09:00:00Z",
  keywords: ["tecnologia", "tutoriais", "youtube", "produtividade", "IA"],
  description: "Tecnologia, produtividade e bastidores de criação de conteúdo — tudo em português, direto ao ponto.",
};

export const demoVideos = videos;

export const demoComments: CommentItem[] = [
  { id: "c1", videoId: videos[0].id, videoTitle: videos[0].title, author: "Miguel Sousa", authorSeed: "ms", text: "Melhor guia que já vi sobre montagem de PC! Já guardei nos favoritos 🔥", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), likes: 142, state: "published", sentiment: "positive" },
  { id: "c2", videoId: videos[1].id, videoTitle: videos[1].title, author: "Ana Ferreira", authorSeed: "af", text: "Falta aí o DaVinci Resolve, não achas? Uso há 2 anos e é free.", publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(), likes: 89, state: "published", sentiment: "question" },
  { id: "c3", videoId: videos[0].id, videoTitle: videos[0].title, author: "TechStore AO", authorSeed: "ts", text: "Comprei as peças pelo teu link, chegou tudo certinho. Obrigado!", publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(), likes: 64, state: "published", replied: true, sentiment: "positive" },
  { id: "c4", videoId: videos[2].id, videoTitle: videos[2].title, author: "Jorge M.", authorSeed: "jm", text: "Que atalho é o do minuto 4:12? Não encontro na descrição.", publishedAt: new Date(Date.now() - 11 * 3600000).toISOString(), likes: 31, state: "published", sentiment: "question" },
  { id: "c5", videoId: videos[4].id, videoTitle: videos[4].title, author: "Sara N.", authorSeed: "sn", text: "Este vídeo chegou na altura certa, estou a iniciar agora. Top!", publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(), likes: 52, state: "published", sentiment: "positive" },
  { id: "c6", videoId: videos[3].id, videoTitle: videos[3].title, author: "Andre P.", authorSeed: "ap", text: "500€? Aqui no Brasil isso não compra nem a placa de vídeo kk", publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(), likes: 210, state: "published", sentiment: "neutral" },
  { id: "c7", videoId: videos[5].id, videoTitle: videos[5].title, author: "Rita C.", authorSeed: "rc", text: "Comparei com outros testes e o teu foi o mais honesto. Parabéns!", publishedAt: new Date(Date.now() - 26 * 3600000).toISOString(), likes: 77, state: "published", sentiment: "positive" },
  { id: "c8", videoId: videos[6].id, videoTitle: videos[6].title, author: "Filmes do Ze", authorSeed: "fz", text: "Qual microfone usaste neste vídeo? O áudio está incrível", publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(), likes: 44, state: "published", sentiment: "question" },
  { id: "c9", videoId: videos[7].id, videoTitle: videos[7].title, author: "Lucas Andrade", authorSeed: "la", text: "Finalmente alguém explicou o YPP sem enrolação!", publishedAt: new Date(Date.now() - 36 * 3600000).toISOString(), likes: 96, state: "published", sentiment: "positive" },
  { id: "c10", videoId: videos[8].id, videoTitle: videos[8].title, author: "Cláudia R.", authorSeed: "cr", text: "Apliquei o método hoje e já organizei 3 anos de vídeos 😅", publishedAt: new Date(Date.now() - 44 * 3600000).toISOString(), likes: 58, state: "published", sentiment: "positive" },
  { id: "h1", videoId: videos[9].id, videoTitle: videos[9].title, author: "crypto_x99", authorSeed: "cx", text: "CHECK MY CHANNEL FREE ROBUX AND CRYPTO SIGNALS 🚀🚀🚀", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), likes: 0, state: "heldForReview", sentiment: "negative" },
  { id: "h2", videoId: videos[1].id, videoTitle: videos[1].title, author: "Duda Souza", authorSeed: "ds", text: "Poderias testar o VSDC? Curioso sobre performance no PC fraco.", publishedAt: new Date(Date.now() - 9 * 3600000).toISOString(), likes: 12, state: "heldForReview", sentiment: "question" },
  { id: "s1", videoId: videos[2].id, videoTitle: videos[2].title, author: "growfast_bot", authorSeed: "gf", text: "BUY YOUTUBE SUBSCRIBERS CHEAP FAST DELIVERY!! dm me", publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(), likes: 0, state: "likelySpam", sentiment: "negative" },
  { id: "s2", videoId: videos[0].id, videoTitle: videos[0].title, author: "viral_tips_247", authorSeed: "vt", text: "GET 10K VIEWS FREE >>> viral . tips <<< limited offer", publishedAt: new Date(Date.now() - 15 * 3600000).toISOString(), likes: 0, state: "likelySpam", sentiment: "negative" },
];

/** 90 days of daily metrics with weekly seasonality + gentle growth */
export function demoTimeseries(days = 90): TimeSeriesPoint[] {
  const r = rng(77);
  const out: TimeSeriesPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dow = d.getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.18 : 1;
    const growth = 1 + (days - i) / days * 0.45;
    const base = 4200 * growth * weekendBoost;
    const views = Math.floor(base * (0.82 + r() * 0.36));
    const watchHours = Math.floor((views * 260) / 3600 * (0.9 + r() * 0.25));
    const subs = Math.max(2, Math.floor(views / 220 * (0.8 + r() * 0.5)));
    out.push({
      date: d.toISOString().slice(0, 10),
      views,
      watchHours,
      subscribersGained: subs,
      ctr: 0.045 + r() * 0.05,
      avgViewPercent: 0.36 + r() * 0.16,
    });
  }
  return out;
}

export const demoTraffic: TrafficSource[] = [
  { source: "Página inicial / Sugeridos", viewsPct: 34 },
  { source: "Pesquisa YouTube", viewsPct: 27 },
  { source: "Externos", viewsPct: 14 },
  { source: "Shorts feed", viewsPct: 12 },
  { source: "Playlists", viewsPct: 7 },
  { source: "Notificações", viewsPct: 6 },
];

export const demoRetention: RetentionPoint[] = Array.from({ length: 21 }, (_, i) => {
  const x = i / 20;
  const intro = Math.max(0, 6 - i) * 1.6;
  const decay = 100 - x * 78 + Math.sin(x * 9) * 3;
  return { pct: Math.round(x * 100), value: Math.max(8, Math.min(100, decay - intro)) };
});

/** 7x24 heatmap: publish score per weekday-hour */
export const demoBestTimes: number[][] = [
  [2, 3, 5, 6, 7, 6, 5, 6, 8, 10, 12, 14, 15, 14, 12, 11, 13, 16, 19, 22, 20, 15, 9, 4],
  [1, 2, 4, 5, 6, 7, 6, 7, 9, 11, 13, 15, 16, 15, 13, 12, 14, 17, 20, 23, 21, 16, 10, 5],
  [1, 2, 4, 5, 6, 7, 7, 8, 10, 12, 14, 16, 17, 16, 14, 13, 15, 18, 21, 24, 22, 17, 11, 6],
  [1, 2, 4, 5, 6, 7, 7, 8, 10, 12, 14, 16, 17, 16, 14, 13, 15, 18, 21, 24, 23, 18, 12, 7],
  [1, 2, 4, 5, 6, 7, 7, 9, 11, 13, 15, 17, 18, 17, 15, 14, 16, 19, 22, 25, 24, 19, 13, 8],
  [2, 3, 5, 6, 7, 8, 9, 11, 13, 15, 17, 19, 20, 19, 17, 16, 18, 21, 23, 24, 22, 18, 12, 6],
  [2, 3, 5, 6, 7, 8, 9, 11, 13, 15, 17, 19, 21, 20, 18, 17, 19, 22, 23, 22, 20, 16, 11, 6],
];

export const demoAiInsights: string[] = [
  "Os teus vídeos com 'Como' no título têm +38% de CTR médio — prioriza tutoriais práticos.",
  "A retenção cai 12% após 45s: encurta a intro para menos de 30 segundos.",
  "Terça-feira às 20h é o teu melhor horário — os últimos 3 uploads de terça tiveram pico de views.",
  "O vídeo 'Editores de Vídeo Gratuitos' gera 3x mais pesquisas externas — cria uma série de sequência.",
  "18% dos comentários pedem conteúdo sobre IA — é o nicho com maior procura nos teus dados.",
];

export const demoActivity: ActivityEntry[] = [
  { id: "a1", at: new Date(Date.now() - 1800000).toISOString(), kind: "automation", title: "Regra 'Bem-vindo a novos comentários' executada", detail: "Rascunho de resposta gerado para 2 comentários" },
  { id: "a2", at: new Date(Date.now() - 7200000).toISOString(), kind: "ai", title: "Roteiro gerado no Estúdio IA", detail: "Tema: Como montar PC gaming" },
  { id: "a3", at: new Date(Date.now() - 21600000).toISOString(), kind: "seo", title: "Título otimizado", detail: "+14 pontos no score do vídeo 'O Erro que 90%...'" },
  { id: "a4", at: new Date(Date.now() - 90000000).toISOString(), kind: "system", title: "Backup local exportado", detail: "dados-do-estudio.json" },
  { id: "a5", at: new Date(Date.now() - 172800000).toISOString(), kind: "community", title: "12 comentários respondidos", detail: "Respostas sugeridas pela IA e aprovadas manualmente" },
];

export const demoKpis: Kpi[] = [
  { key: "views", label: "Visualizações", value: 152400, deltaPct: 12.4, format: "compact", spark: [64, 68, 62, 70, 75, 72, 80, 78, 84, 88, 86, 94] },
  { key: "watch", label: "Horas vistas", value: 8340, deltaPct: 8.1, format: "hours", spark: [55, 58, 60, 59, 64, 68, 66, 72, 75, 79, 82, 88] },
  { key: "subs", label: "Subscritores", value: 542, deltaPct: 15.2, format: "count", spark: [40, 44, 48, 46, 52, 58, 61, 66, 70, 76, 84, 92] },
  { key: "ctr", label: "CTR médio", value: 0.062, deltaPct: 3.8, format: "percent", spark: [50, 52, 51, 54, 53, 56, 58, 57, 60, 62, 61, 64] },
];

/** Starter automation rules shown in demo mode */
export function demoRules(): AutomationRule[] {
  const now = new Date();
  return [
    {
      id: "r1",
      name: "Boas-vindas inteligentes",
      enabled: true,
      trigger: { type: "on_new_comment" },
      conditions: [{ metric: "sentiment", op: "contains", value: "positive" }],
      actions: [{ type: "ai_draft_reply" }, { type: "notify" }],
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      lastRunAt: new Date(now.getTime() - 1800000).toISOString(),
      runCount: 34,
    },
    {
      id: "r2",
      name: "Tags de série automática",
      enabled: true,
      trigger: { type: "on_new_video" },
      conditions: [{ metric: "keywords", op: "contains", value: "tutorial" }],
      actions: [{ type: "append_tags", params: { tags: "tutorial,passo a passo,2026" } }, { type: "notify" }],
      createdAt: new Date(now.getTime() - 21 * 86400000).toISOString(),
      lastRunAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      runCount: 9,
    },
    {
      id: "r3",
      name: "Ideias semanais de domingo",
      enabled: false,
      trigger: { type: "on_schedule", intervalHours: 168 },
      conditions: [],
      actions: [{ type: "generate_ideas" }, { type: "notify" }],
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
      runCount: 4,
    },
    {
      id: "r4",
      name: "Festa dos 50K",
      enabled: true,
      trigger: { type: "on_milestone", metric: "subscribers", threshold: 50000 },
      conditions: [],
      actions: [{ type: "notify" }, { type: "generate_ideas" }],
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
      runCount: 0,
    },
  ];
}
