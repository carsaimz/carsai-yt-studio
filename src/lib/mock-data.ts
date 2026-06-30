// Dados de demonstração — substitua pelas respostas reais da YouTube Data API
// assim que o usuário cadastrar a chave em Configurações → YouTube.

export const channelStats = {
  name: "Carsai Channel",
  handle: "@carsai",
  avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=carsai&backgroundColor=ff5a3c",
  subscribers: 248930,
  totalViews: 18420315,
  totalVideos: 312,
  watchTimeHours: 421500,
};

export const overviewMetrics = [
  { label: "Inscritos", value: "248,9 mil", delta: "+1,8% (7d)", trend: "up" as const },
  { label: "Visualizações (28d)", value: "1,42 M", delta: "+12,4%", trend: "up" as const },
  { label: "Tempo de exibição", value: "62,1 mil h", delta: "+8,1%", trend: "up" as const },
  { label: "CTR médio", value: "7,3%", delta: "-0,4%", trend: "down" as const },
];

export const viewsTrend = Array.from({ length: 28 }, (_, i) => ({
  day: `D${i + 1}`,
  views: Math.round(35000 + Math.sin(i / 3) * 8000 + Math.random() * 6000),
  watchTime: Math.round(1800 + Math.cos(i / 4) * 400 + Math.random() * 300),
}));

export const trafficSources = [
  { source: "Sugeridos", value: 38 },
  { source: "Busca YouTube", value: 24 },
  { source: "Externo", value: 14 },
  { source: "Canal", value: 12 },
  { source: "Outros", value: 12 },
];

export const recentVideos = [
  {
    id: "vid_01",
    title: "Como montei um estúdio caseiro de R$ 800",
    thumbnail: "https://picsum.photos/seed/v1/320/180",
    views: 84210,
    likes: 5120,
    comments: 412,
    publishedAt: "2 dias atrás",
    duration: "12:48",
    status: "published" as const,
  },
  {
    id: "vid_02",
    title: "IA generativa para thumbnails: passo a passo",
    thumbnail: "https://picsum.photos/seed/v2/320/180",
    views: 145820,
    likes: 9821,
    comments: 1023,
    publishedAt: "5 dias atrás",
    duration: "18:02",
    status: "published" as const,
  },
  {
    id: "vid_03",
    title: "5 erros que matam seu CTR (e como corrigir)",
    thumbnail: "https://picsum.photos/seed/v3/320/180",
    views: 62110,
    likes: 4400,
    comments: 318,
    publishedAt: "1 semana atrás",
    duration: "09:31",
    status: "published" as const,
  },
  {
    id: "vid_04",
    title: "Roteiro com IA — modelo grátis em 2026",
    thumbnail: "https://picsum.photos/seed/v4/320/180",
    views: 0,
    likes: 0,
    comments: 0,
    publishedAt: "agendado",
    duration: "14:20",
    status: "scheduled" as const,
  },
];

export const playlists = [
  { id: "pl_1", title: "Tutoriais de IA", videos: 24, views: "412k" },
  { id: "pl_2", title: "Bastidores do estúdio", videos: 11, views: "98k" },
  { id: "pl_3", title: "Lives gravadas 2026", videos: 18, views: "210k" },
];

export const comments = [
  {
    id: "c1",
    author: "Marina Costa",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Marina",
    video: "IA generativa para thumbnails",
    text: "Esse passo do Photopea salvou meu canal, valeu demais!",
    sentiment: "positivo" as const,
    urgency: "baixa" as const,
    time: "2 min",
  },
  {
    id: "c2",
    author: "Renato Lima",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Renato",
    video: "5 erros que matam seu CTR",
    text: "O áudio ficou baixo no minuto 4, dá pra corrigir?",
    sentiment: "neutro" as const,
    urgency: "média" as const,
    time: "18 min",
  },
  {
    id: "c3",
    author: "anon_42",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=anon",
    video: "Como montei um estúdio caseiro",
    text: "Conteúdo fraco, esperava mais.",
    sentiment: "negativo" as const,
    urgency: "alta" as const,
    time: "1 h",
  },
  {
    id: "c4",
    author: "Júlia Andrade",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Julia",
    video: "Roteiro com IA",
    text: "Vocês fazem consultoria? Quero levar pro meu canal.",
    sentiment: "positivo" as const,
    urgency: "alta" as const,
    time: "3 h",
  },
];

export const seoSuggestions = [
  { keyword: "thumbnail com ia", score: 88, volume: "alta", competition: "média" },
  { keyword: "estúdio caseiro youtube", score: 74, volume: "média", competition: "baixa" },
  { keyword: "ctr youtube 2026", score: 69, volume: "média", competition: "alta" },
  { keyword: "roteiro ia gratis", score: 92, volume: "alta", competition: "baixa" },
];

export const trends = [
  { topic: "Gemini 3 Flash em produção", growth: "+412%", category: "IA" },
  { topic: "Shorts verticais de 90s", growth: "+128%", category: "Formato" },
  { topic: "Tutoriais Capacitor 6", growth: "+96%", category: "Dev" },
  { topic: "Reviews de microfones USB-C", growth: "+74%", category: "Hardware" },
];

export const aiAgents = [
  {
    id: "scriptwriter",
    name: "Agente Roteirista",
    description: "Gera scripts completos com estrutura narrativa, ganchos e CTAs.",
    icon: "FileText",
    runs: 142,
  },
  {
    id: "thumbnail",
    name: "Agente de Thumbnail",
    description: "Sugere composições, copy e gera variações com IA generativa.",
    icon: "Image",
    runs: 89,
  },
  {
    id: "trend",
    name: "Agente de Tendências",
    description: "Monitora pautas em alta e cruza com seu nicho.",
    icon: "TrendingUp",
    runs: 56,
  },
  {
    id: "summary",
    name: "Agente de Resumo",
    description: "Cria descrições, posts para redes e capítulos do vídeo.",
    icon: "Sparkles",
    runs: 211,
  },
];
