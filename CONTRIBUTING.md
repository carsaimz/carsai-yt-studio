# Contributing to Carsai YT Studio

Obrigado por considerares contribuir! 🎬

## Comunidade

- 💬 [Discussões](https://github.com/carsaimz/carsai-yt-studio/discussions) — perguntas, ideias, roadmap e apresentações (Q&A, Ideas, Show and tell, Roadmap)
- 🐛 [Issues](https://github.com/carsaimz/carsai-yt-studio/issues) — bugs e pedidos de funcionalidades com templates prontos
- 🌐 Site oficial: [carsaiytstudio.vercel.app](https://carsaiytstudio.vercel.app)

Antes de abrir uma issue, procura nas Discussões e Issues existentes — pode já haver uma conversa em curso.

## Como contribuir

1. **Fork** o repositório e cria um branch: `git checkout -b feat/minha-feature`
2. Instala dependências: `bun install` (ou `npm install`)
3. Faz as alterações com **TypeScript** tipado e segue o estilo existente
4. Garante que `bun run typecheck`, `bun run lint` e `bun run build` passam sem erros
5. Testa manualmente as vistas afetadas (web + viewport móvel)
6. Abre um **Pull Request** com descrição clara e screenshots se houver UI

## Convenções

- **Design**: usa os tokens do tema Obsidian (`--flame`, `--orchid`, componentes shadcn/ui); nada de cores fixas fora dos tokens
- **i18n**: todos os textos visíveis passam por `useI18n().t()` nos dicionários `src/lib/studio/i18n.tsx` (PT/EN/ES)
- **Estado**: preferir `useStudioStore` (Zustand + persist); nada de `fetch` de dados secretos para servidores externos
- **Chaves de API**: nunca commitar chaves; a vault local é o único caminho
- **Segurança**: chamadas externas apenas para APIs oficiais diretamente do cliente
- **Responsividade**: componentes novos devem ser testados em 360px de largura; nada de larguras fixas sem `max-w-full`

## Releases

As releases são criadas por tag (`v*`) — o workflow `release.yml` compila, empacota e publica as notas extraídas do [CHANGELOG.md](CHANGELOG.md). Mantém o CHANGELOG atualizado a cada PR relevante (secção "Unreleased" ou a próxima versão).

## Reportar bugs

Abre uma issue com o template de bug: passos para reproduzir, comportamento esperado vs. atual, plataforma (web/android/desktop) e capturas de ecrã.

## Ideias de contribuição

- Novos provedores de IA (compatíveis com OpenAI-compatible APIs)
- Novas ferramentas no Estúdio SEO / Ferramentas / YouTube Hub
- Melhores visualizações no painel de analytics
- i18n para novos idiomas
- Testes end-to-end (Playwright)
