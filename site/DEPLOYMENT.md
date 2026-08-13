# Publicação da página

## Produção

- Plataforma principal: Cloudflare Pages.
- Projeto: `iconocracia-cv`.
- URL: <https://iconocracia-cv.pages.dev/>.
- Primeira publicação: `2026-08-13`.
- Fonte versionada: `site/index.html` e
  `analysis/huggingface-regime-coverage-2026-08-13/`.

O projeto também possui um workflow para GitHub Pages em
`.github/workflows/deploy-pages.yml`. Na conta atual, os endereços de projeto do
GitHub Pages herdam `anavanzin.com` e podem receber o challenge global do
Cloudflare. Por isso, o endereço `pages.dev` é o link público principal.

## Republicar

Com uma sessão autenticada do Wrangler:

```bash
publish_dir="$(mktemp -d)"
cp site/index.html "$publish_dir/index.html"
mkdir "$publish_dir/analysis"
cp -R analysis/huggingface-regime-coverage-2026-08-13 \
  "$publish_dir/analysis/"

npx wrangler pages deploy "$publish_dir" \
  --project-name iconocracia-cv \
  --branch main
```

O diretório publicado contém somente a página e os artefatos analíticos. O
freeze completo da disciplina em `data/` não é incluído no site.
