#!/data/data/com.termux/files/usr/bin/bash
set -e

SRC_REPO="https://github.com/carsaimz/carsai-yt-studio-pro.git"
DEST_REPO="https://github.com/carsaimz/carsai-yt-studio.git"
TOKEN="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" # COLE SEU TOKEN NOVO AQUI. NUNCA COMMITE ISSO
WORK_DIR="$HOME/.yt-studio-sync"
BRANCH="main"

pkg install -y git-lfs # git-lfs é obrigatório se tiver arquivo grande

echo ">>> 2. Limpando pasta de trabalho"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

[ -z "$TOKEN" ] && { echo "ERRO: Cole seu GITHUB TOKEN"; exit 1; }

SRC_URL="https://x-access-token:${TOKEN}@github.com/carsaimz/carsai-yt-studio-pro.git"
DEST_URL="https://x-access-token:${TOKEN}@github.com/carsaimz/carsai-yt-studio.git"

echo ">>> 3. Clone COMPLETO - sem --depth=1"
git clone --branch "$BRANCH" "$SRC_URL" repo
cd repo
git lfs pull # evita o index-pack failed se tiver LFS

echo ">>> 4. Configurando git"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

echo ">>> 5. Removendo.github/workflows/sync.yml"
rm -f -- .github/workflows/sync.yml
# rm sync.sh

echo ">>> 6. Commitando a remoção"
git add .
git commit -m "chore: sync from pro [skip ci]" || echo "Nada para commitar"

echo ">>> 7. Push force para o repo publico"
git remote add destination "$DEST_URL" 2>/dev/null || git remote set-url destination "$DEST_URL"
git push destination "+HEAD:refs/heads/main" --force

cd "$HOME"
rm -rf "$WORK_DIR"
echo "✅ Synced to carsaimz/carsai-yt-studio"