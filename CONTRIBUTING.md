# Contributing to Carsai YT Studio

Obrigado por considerares contribuir! 🎬

## Como contribuir

1. **Fork** o repositório e cria um branch: `git checkout -b feat/minha-feature`
2. Faz as alterações com **TypeScript** tipado e segue o estilo existente
3. Garante que `npm run lint` passa sem erros
4. Testa manualmente as vistas afetadas (web + viewport móvel)
5. Abre um **Pull Request** com descrição clara e screenshots se houver UI

## Convenções

- **Design**: usa os tokens do tema Obsidian (`--flame`, `--orchid`, componentes shadcn/ui); nada de cores fixas fora dos tokens
- **i18n**: todos os textos visíveis passam por `useI18n().t()` nos dicionários `src/lib/studio/i18n.tsx` (PT/EN/ES)
- **Estado**: preferir `useStudioStore` (Zustand + persist); nada de `fetch` de dados secretos para servidores externos
- **Chaves de API**: nunca commitar chaves; a vault local é o único caminho
- **Segurança**: chamadas externas apenas para APIs oficiais diretamente do cliente

## Reportar bugs

Abre uma issue com: passos para reproduzir, comportamento esperado vs. atual, plataforma (web/android/desktop) e capturas de ecrã.

## Ideias de contribuição

- Novos provedores de IA (compatíveis com OpenAI-compatible APIs)
- Novas ferramentas no Estúdio SEO / Ferramentas
- Melhores visualizações no painel de analytics
- i18n para novos idiomas
