# AGENTS.md — A Jornada Noturna de Rá

## Objetivo do projeto

Construir um jogo de tabuleiro digital premium inspirado no tabuleiro físico original “A Jornada Noturna de Rá”.

O jogo deve funcionar no navegador e futuramente permitir multiplayer online.

---

# Filosofia do projeto

- Priorizar experiência visual forte.
- Código organizado e sustentável.
- Pouco retrabalho.
- Componentização simples.
- Evitar overengineering.
- Responsividade mobile-first.
- Performance alta.
- Baixa complexidade inicial.

---

# Stack oficial

- React
- Vite
- Phaser.js
- TypeScript
- CSS modular simples

---

# Diretrizes importantes

## Visual

O jogo deve parecer um produto comercial.

Referências:
- jogos mobile premium;
- UI cinematográfica;
- iluminação dourada;
- animações suaves;
- estética egípcia antiga.

## Gameplay

- 2 a 4 jogadores.
- Movimento baseado em dado.
- Sistema de turnos.
- Casas especiais.
- Carta Olho de Rá.
- Vitória ao derrotar Apófis.

## Arquitetura

Separar:
- lógica do jogo;
- renderização;
- assets;
- animações;
- UI.

Evitar misturar regra de negócio com renderização.

---

# Estrutura esperada

```text
src/
  game/
    scenes/
    systems/
    entities/
    data/
  components/
  ui/
  hooks/
  styles/
public/assets/
```

---

# Regras de desenvolvimento

- Sempre gerar código completo.
- Não remover funcionalidades existentes sem motivo.
- Não refatorar excessivamente.
- Implementar primeiro a funcionalidade mínima funcional.
- Depois adicionar refinamento visual.
- Priorizar jogabilidade antes de efeitos complexos.

---

# Roadmap inicial

## Fase 1

- Estrutura React + Phaser.
- Cena principal.
- Carregamento do tabuleiro.
- Peças posicionadas.
- Sistema de turnos.
- Dado.
- Movimento.

## Fase 2

- Casas especiais.
- Cartas.
- Eventos.
- Efeitos sonoros.
- Animações.

## Fase 3

- Multiplayer online.
- Lobby.
- Código da sala.
- Sincronização.

---

# Objetivo final

Transformar o projeto em:
- jogo web;
- APK Android;
- possível produto educacional comercial.
