# ICONOCRACIA-CV — Alegorias femininas da Justiça como problema de Visão Computacional

Projeto de semestre para a disciplina **INE410159 / TRV410001 — Visão Computacional (2026.2)**,
UFSC, Profs. Aldo von Wangenheim e Antonio Sobieranski.

**Autora / especialista de domínio:** Ana Vitória Vanzin Mendes — doutoranda no PPGD/UFSC,
tese *ICONOCRACIA: Alegoria Feminina na História da Cultura Jurídica (Séculos XIX–XX)*.

## O problema em um parágrafo

O Direito construiu ao longo de séculos uma gramática visual própria — a alegoria feminina
da Justiça com venda, balança e espada, frontispícios de códigos, iluminuras, gravuras, selos.
Este projeto trata um corpus real de pesquisa de doutorado (**335 imagens curadas**, codificadas
por um codebook iconográfico com auditoria de confiabilidade) como um problema de visão
computacional: classificação de atributos, busca por similaridade (CBIR), clustering de
"famílias" iconográficas e medição do *endurecimento* (fixidez) das soluções visuais ao longo
do tempo — atacado pelos dois paradigmas da disciplina: visão clássica e aprendizado profundo.

## Estrutura

```
data/     freeze do corpus para o semestre (imutável, reprodutível)
docs/     pitch de apresentação + protocolo técnico / data card
```

- **Freeze:** `ICONOCRACIA-CV-2026-08-12` — 335 registros, export público do corpus de pesquisa
  (commit-base `0f80b6b` do monorepo de tese). O corpus de pesquisa continua crescendo;
  este freeze permanece imutável para garantir reprodutibilidade dos experimentos.
- **Docs:**
  - [Pitch de apresentação e formação de grupo](docs/apresentacao-visao-computacional-2026-2.md)
  - [Protocolo técnico e data card](docs/projeto-disciplina-visao-computacional-2026-2.md)

## Roadmap do semestre

1. **Visão clássica (Módulo 1):** histogramas de cor + medidas de distância (Cap. 1.1);
   segmentação figura–fundo (Cap. 1.2); descritores HOG/SIFT/ORB (Cap. 1.4) → similaridade por kNN.
2. **Aprendizado profundo (Módulo 2):** embeddings CLIP/DINOv2 (Cap. 2.7) → clustering e retrieval;
   opcionalmente detecção de atributos (Caps. 2.3–2.4).
3. **Avaliação:** convergência/divergência entre os agrupamentos automáticos e o codebook
   iconográfico (ground truth anotado e auditado).
4. **Entrega:** poster session — *um atlas de similaridade das alegorias femininas da Justiça*.

## Repo de origem

Monorepo da tese (pipeline completo, codebook, decisões metodológicas):
[anavvanzin/iconocracy-corpus](https://github.com/anavvanzin/iconocracy-corpus)
