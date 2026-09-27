# OSINT Analyst Playbooks

Esta documentação ensina **como usar cada checagem do checklist**, sem colocar tutorial metodológico dentro da aplicação web. A aplicação continua operacional; o GitHub funciona como handbook e material de estudo.

Cada item responde seis perguntas:

1. Por que esta checagem existe?
2. Como executar?
3. O que registrar?
4. Quando considerar concluída?
5. Qual é o erro comum?
6. Como ela ajuda a decisão?

## Fluxo de aprendizagem e investigação

O método está organizado em cinco macroetapas:

1. **Direção** — transformar demanda em requisito, escopo e plano.
2. **Coleta** — buscar, pivotar e verificar presença, fontes e artefatos.
3. **Corroboração & síntese** — ordenar tempo, avaliar fontes, preservar evidência e comparar hipóteses.
4. **Análise & decisão** — responder requisitos, calibrar confiança e decidir se deve parar, continuar, monitorar ou escalar.
5. **Entrega & aprendizado** — reportar, revisar, encerrar e incorporar lições.

Veja também [Analyst Decision Flow](ANALYST-DECISION-FLOW.md) e [Modo Diário de Bordo](LOGBOOK-MODE.md).

## Playbooks por fase

- [01 · Intake e pergunta de inteligência](playbooks/01-intake.md) — 9 checagens
- [02 · Escopo, legalidade e minimização](playbooks/02-scope.md) — 8 checagens
- [03 · OPSEC e ambiente de coleta](playbooks/03-opsec.md) — 5 checagens
- [04 · Baseline: fatos, entidades e identificadores](playbooks/04-baseline.md) — 7 checagens
- [05 · Plano de coleta e estratégia de pivôs](playbooks/05-collection-plan.md) — 8 checagens
- [06 · Descoberta web e estratégia de busca](playbooks/06-search.md) — 9 checagens
- [07 · Presença pública e SOCMINT](playbooks/07-socmint.md) — 8 checagens
- [08 · Pivôs de username e identificadores](playbooks/08-identifiers.md) — 6 checagens
- [09 · Exposição de e-mail e telefone](playbooks/09-contact-exposure.md) — 5 checagens
- [10 · Organização e registros públicos](playbooks/10-organizations.md) — 5 checagens
- [11 · Domínios e infraestrutura pública](playbooks/11-infrastructure.md) — 6 checagens
- [12 · Imagens, vídeos e documentos](playbooks/12-media.md) — 6 checagens
- [13 · GEOINT e verificação temporal](playbooks/13-geoint.md) — 4 checagens
- [14 · Linha do tempo e relações](playbooks/14-timeline.md) — 5 checagens
- [15 · Avaliação de fontes e corroboracão](playbooks/15-source-evaluation.md) — 9 checagens
- [16 · Preservação e registro de evidências](playbooks/16-evidence.md) — 8 checagens
- [17 · Análise estruturada, alternativas e confiança](playbooks/17-analysis.md) — 12 checagens
- [18 · Gate de decisão e suficiência analítica](playbooks/18-decision-gate.md) — 7 checagens
- [19 · Relatório, revisão e encerramento](playbooks/19-reporting.md) — 10 checagens
- [20 · Pós-caso, aprendizado e monitoramento](playbooks/20-post-case.md) — 6 checagens

## Referências que influenciaram o método

- **Berkeley Protocol on Digital Open Source Investigations (OHCHR + UC Berkeley, 2022)** — identificação, coleta, preservação, análise, apresentação, segurança, legalidade e ética.  
  https://www.ohchr.org/sites/default/files/2022-04/OHCHR_BerkeleyProtocol.pdf
- **ICD 203 — Analytic Standards (ODNI)** — qualidade de fontes, incerteza, distinção entre informação e julgamento, alternativas, relevância para o decisor e argumentação lógica.  
  https://www.dni.gov/files/documents/ICD/ICD-203.pdf
- **NATO AJP-2 — Intelligence, Counter-Intelligence and Security** — avaliação independente da confiabilidade da fonte e credibilidade da informação.  
  https://coi.nato.int/
- **Bellingcat Online Investigation Toolkit** — requisitos, limitações, considerações éticas e adequação da ferramenta ao problema.  
  https://bellingcat.gitbook.io/toolkit
- **Bellingcat — OSHIT: Seven Deadly Sins of Bad Open Source Research** — origem da fonte, verificação, limitações de ferramentas e risco de conclusões superconfiantes.  
  https://www.bellingcat.com/resources/2024/04/25/oshit-seven-deadly-sins-of-bad-open-source-research/
- **ATP 2-22.9 Open-Source Intelligence** — referência histórica para OSINT como disciplina, planejamento e integração ao ciclo de inteligência. É útil como base, mas parte de seu contexto institucional é datado.  
  https://www.bits.de/NRANEU/others/amd-us-archive/atp2-22-9%2812%29.pdf

> O projeto não é uma implementação oficial ou certificada de nenhuma dessas publicações. Elas são referências de tradecraft usadas para informar decisões de design.
