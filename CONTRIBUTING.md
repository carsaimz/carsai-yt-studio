# Contribuindo / Contributing / Contribuyendo

---

## 🇧🇷 Português

### Como Contribuir

Obrigado pelo interesse em contribuir com o Carsai YT Studio!

#### Formas de Contribuir

- 🐛 **Reportar bugs** — [Abrir uma issue](https://github.com/carsaimz/carsai-yt-studio/issues/new?template=bug_report.yml)
- ✨ **Sugerir funcionalidades** — [Abrir uma discussão](https://github.com/carsaimz/carsai-yt-studio/discussions)
- 🔧 **Enviar código** — Fork → Branch → PR
- 📖 **Melhorar docs** — Edite os ficheiros em `src/routes/docs.tsx` ou `docs/wiki/`
- 🌍 **Traduções** — Edite `src/lib/i18n/`

#### Configurar Ambiente de Desenvolvimento

```bash
# 1. Fork e clone
git clone https://github.com/SEU_USER/carsai-yt-studio.git
cd carsai-yt-studio

# 2. Instalar dependências
npm install

# 3. Criar ficheiro .env
cp .env.example .env
# Preencher com as suas chaves Firebase

# 4. Iniciar desenvolvimento
npm run dev
```

#### Fluxo de Contribuição

1. **Fork** o repositório
2. **Crie um branch** descritivo: `git checkout -b feat/minha-funcionalidade`
3. **Faça commits** seguindo [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: adicionar suporte a Shorts
   fix: corrigir crash no Android 14
   docs: actualizar guia OAuth
   ```
4. **Verifique** sem erros: `npm run typecheck && npm run lint`
5. **Abra um Pull Request** com descrição clara

#### Padrões de Código

- TypeScript estrito — sem `any` implícito
- Componentes React funcionais com hooks
- i18n obrigatório para strings visíveis ao utilizador (use `t("key")`)
- Tailwind CSS v4 para estilos — sem CSS inline
- Commits em Conventional Commits

---

## 🇺🇸 English

### How to Contribute

Thank you for your interest in contributing to Carsai YT Studio!

#### Ways to Contribute

- 🐛 **Report bugs** — [Open an issue](https://github.com/carsaimz/carsai-yt-studio/issues/new?template=bug_report.yml)
- ✨ **Suggest features** — [Open a discussion](https://github.com/carsaimz/carsai-yt-studio/discussions)
- 🔧 **Submit code** — Fork → Branch → PR
- 📖 **Improve docs** — Edit files in `src/routes/docs.tsx` or `docs/wiki/`
- 🌍 **Translations** — Edit `src/lib/i18n/`

#### Development Setup

```bash
git clone https://github.com/YOUR_USER/carsai-yt-studio.git
cd carsai-yt-studio
npm install
cp .env.example .env
# Fill in your Firebase keys
npm run dev
```

#### Contribution Flow

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/my-feature`
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/)
4. **Verify**: `npm run typecheck && npm run lint`
5. **Open a Pull Request**

#### Code Standards

- Strict TypeScript — no implicit `any`
- Functional React components with hooks
- i18n required for user-visible strings (`t("key")`)
- Tailwind CSS v4 for styling
- Conventional Commits format

---

## 🇪🇸 Español

### Cómo Contribuir

¡Gracias por tu interés en contribuir a Carsai YT Studio!

#### Formas de Contribuir

- 🐛 **Reportar errores** — [Abrir un issue](https://github.com/carsaimz/carsai-yt-studio/issues/new?template=bug_report.yml)
- ✨ **Sugerir funcionalidades** — [Abrir una discusión](https://github.com/carsaimz/carsai-yt-studio/discussions)
- 🔧 **Enviar código** — Fork → Branch → PR

#### Configuración

```bash
git clone https://github.com/TU_USUARIO/carsai-yt-studio.git
cd carsai-yt-studio
npm install
cp .env.example .env
npm run dev
```

---

*Todos os contribuidores devem seguir o [Código de Conduta](CODE_OF_CONDUCT.md).*
*All contributors must follow the [Code of Conduct](CODE_OF_CONDUCT.md).*
