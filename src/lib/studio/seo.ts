"use client";

import type { Video } from "./types";

const POWER_WORDS = [
  "grátis", "free", "gratuito", "passo a passo", "guia", "completo", "definitivo",
  "segredo", "erros", "nunca", "sempre", "agora", "2026", "novo", "honesto",
  "testei", "vs", "como", "rápido", "fácil", "incrível", "melhor", "top",
  "tutorial", "barato", "vale a pena", "guia completo", "paso a paso", "honesto",
];

export interface SeoCheck {
  id: string;
  label: string;
  pass: boolean;
  weight: number;
  detail: string;
}

export interface TitleAnalysis {
  score: number; // 0..100
  checks: SeoCheck[];
  powerWords: string[];
  suggestions: string[];
}

export function analyzeTitle(title: string): TitleAnalysis {
  const t = title.trim();
  const checks: SeoCheck[] = [];
  const len = t.length;
  const words = t.split(/\s+/).filter(Boolean);
  const lower = t.toLowerCase();

  checks.push({
    id: "length",
    label: "Comprimento ideal (40–70 caracteres)",
    pass: len >= 40 && len <= 70,
    weight: 20,
    detail: `${len} caracteres — ${len < 40 ? "muito curto, aproveita para adicionar contexto" : len > 70 ? "pode ser cortado em algumas superfícies" : "dentro do intervalo ideal"}`,
  });
  checks.push({
    id: "words",
    label: "7–12 palavras",
    pass: words.length >= 7 && words.length <= 12,
    weight: 15,
    detail: `${words.length} palavras`,
  });
  const pw = POWER_WORDS.filter((w) => lower.includes(w));
  checks.push({
    id: "power",
    label: "Contém palavra de impacto",
    pass: pw.length > 0,
    weight: 20,
    detail: pw.length ? `Encontradas: ${pw.slice(0, 5).join(", ")}` : "Nenhuma palavra de impacto encontrada",
  });
  checks.push({
    id: "number",
    label: "Inclui número (lista ou data)",
    pass: /\d/.test(t),
    weight: 10,
    detail: /\d/.test(t) ? "Números aumentam CTR em listas/tutoriais" : "Adiciona um número (ex.: '5 erros', '2026')",
  });
  checks.push({
    id: "keywordFront",
    label: "Palavra-chave no início",
    pass: words.length > 0 && words.slice(0, 3).some((w) => w.length > 3),
    weight: 10,
    detail: "Os primeiros termos pesam mais na pesquisa",
  });
  checks.push({
    id: "noClickbaitCaps",
    label: "Sem CAPS excessivo",
    pass: !(t.replace(/[^A-ZÀ-Ý]/g, "").length / Math.max(len, 1) > 0.4),
    weight: 10,
    detail: "CAPS em excesso reduz confiança",
  });
  checks.push({
    id: "brackets",
    label: "Usa colchetes ou parênteses",
    pass: /[[(]/.test(t),
    weight: 10,
    detail: "[Guia] / (2026) destacam-se nos resultados",
  });
  checks.push({
    id: "clarity",
    label: "Sem duplicação de palavras",
    pass: words.length === new Set(words.map((w) => w.toLowerCase().replace(/[^\wà-ú]/g, ""))).size || words.length < 4,
    weight: 5,
    detail: "Palavras repetidas desperdiçam caracteres",
  });

  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  const got = checks.filter((c) => c.pass).reduce((a, c) => a + c.weight, 0);
  const score = Math.round((got / totalWeight) * 100);

  const suggestions: string[] = [];
  if (!checks[0].pass) suggestions.push(len < 40 ? `${t} — Guia Completo 2026` : `${t.slice(0, 67)}`);
  if (!checks[2].pass) suggestions.push(`${t} (Grátis e Passo a Passo)`);
  if (!checks[3].pass) suggestions.push(`5 ${t.charAt(0).toLowerCase() + t.slice(1)}`);
  if (!checks[6].pass) suggestions.push(`${t} [Guia Completo]`);
  return { score, checks, powerWords: pw, suggestions: suggestions.slice(0, 4) };
}

export interface DescriptionAnalysis {
  score: number;
  hasChapters: boolean;
  hasLinks: boolean;
  hasHashtags: boolean;
  hasFirstLineHook: boolean;
  lengthOk: boolean;
}

export function analyzeDescription(desc: string): DescriptionAnalysis {
  const d = desc.trim();
  const lines = d.split("\n");
  return {
    score: Math.round(
      ([
        /\n0?0:0?0/.test(d) || /\n\d{1,2}:\d{2}/.test(d),
        /https?:\/\//.test(d),
        /#[\wÀ-ÿ]+/.test(d),
        d.length > 0 && lines[0].length > 20,
        d.length >= 200,
      ].filter(Boolean).length / 5) * 100
    ),
    hasChapters: /\n\d{1,2}:\d{2}/.test(d),
    hasLinks: /https?:\/\//.test(d),
    hasHashtags: /#[\wÀ-ÿ]+/.test(d),
    hasFirstLineHook: d.length > 0 && lines[0].length > 20,
    lengthOk: d.length >= 200,
  };
}

export interface VideoSeoResult {
  title: TitleAnalysis;
  description: DescriptionAnalysis;
  tagsScore: number;
  total: number;
  issues: string[];
}

export function analyzeVideo(video: Pick<Video, "title" | "description" | "tags">): VideoSeoResult {
  const title = analyzeTitle(video.title);
  const description = analyzeDescription(video.description);
  const tagCount = video.tags?.length || 0;
  const tagsScore = tagCount === 0 ? 0 : Math.min(100, 40 + tagCount * 10);
  const total = Math.round(title.score * 0.45 + description.score * 0.25 + tagsScore * 0.3);
  const issues: string[] = [];
  if (tagCount < 5) issues.push(`Poucas tags (${tagCount}) — adicione 8–15 tags relevantes`);
  if (!description.hasChapters) issues.push("Sem capítulos na descrição (00:00 ...) — melhora retenção e pesquisa");
  if (!description.hasLinks) issues.push("Sem links na descrição");
  if (!description.hasHashtags) issues.push("Sem hashtags — adicione 2–3 relevantes");
  return { title, description, tagsScore, total, issues };
}

export function generateHashtags(title: string, tags: string[] = []): string[] {
  const base = [title.toLowerCase(), ...tags.map((t) => t.toLowerCase())]
    .flatMap((t) => t.split(/[\s—\-:,.]+/))
    .filter((w) => w.length > 3 && !/^\d+$/.test(w))
    .slice(0, 8);
  const uniq = Array.from(new Set(base)).map((w) => `#${w.replace(/[^\wà-ÿ]/g, "")}`);
  return uniq.slice(0, 8);
}

export function suggestTags(title: string, niche: string[] = []): string[] {
  const words = title
    .toLowerCase()
    .split(/[\s—\-:,.()?]+/)
    .filter((w) => w.length > 3 && !["para", "como", "sobre", "com", "the", "and"].includes(w));
  const combos = [
    `${words.slice(0, 3).join(" ")} tutorial`,
    `${words.slice(0, 2).join(" ")} 2026`,
    `${words.slice(0, 2).join(" ")} passo a passo`,
    `${words.slice(0, 2).join(" ")} para iniciantes`,
    `como ${words.slice(0, 2).join(" ")}`,
  ];
  return Array.from(new Set([...words.slice(0, 6), ...combos, ...niche])).slice(0, 12);
}
