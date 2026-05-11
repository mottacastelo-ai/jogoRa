# A Jornada Noturna de Rá — Jogo Online

Projeto do jogo de tabuleiro online **A Jornada Noturna de Rá**, baseado no tabuleiro físico original.

## Objetivo

Criar uma versão digital premium, jogável no navegador, com visual egípcio, tabuleiro ilustrado, peças animadas, dado, cartas e regras completas.

## Stack planejada

- React
- Vite
- Phaser.js
- TypeScript
- GitHub Pages

## Escopo da versão 2.0

- Tela inicial do jogo
- Tabuleiro original como asset principal
- Peças originais digitalizadas/recortadas
- Movimento animado das peças pelo caminho
- Sistema de turnos para 2 a 4 jogadores
- Dado animado
- Casas especiais: Energia, Barca, Correntes, Escuridão, Fogo, Labirinto, Apófis, Deuses, Olho de Rá e Apófis Forte
- Carta Olho de Rá para ignorar desafio negativo
- Batalha final contra Apófis
- Tela de vitória
- Layout responsivo para desktop e mobile

## Estrutura de assets sugerida

```text
public/assets/
  board/
    tabuleiro-original.png
  pieces/
    jogador-vermelho.png
    jogador-azul.png
    jogador-verde.png
    jogador-dourado.png
  ui/
    carta-olho-ra.png
    dado.png
  audio/
    dice.mp3
    move.mp3
    victory.mp3
```

## Desenvolvimento

Após clonar o repositório:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Deploy no GitHub Pages:

```bash
npm run deploy
```

## Observação

O projeto deve priorizar uma experiência visual forte e fluida, mas com arquitetura simples e sustentável.
