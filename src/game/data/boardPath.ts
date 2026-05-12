export type BoardCellType =
  | 'start'
  | 'normal'
  | 'energy'
  | 'apophis'
  | 'chains'
  | 'darkness'
  | 'gods'
  | 'eye'
  | 'fire'
  | 'path'
  | 'labyrinth'
  | 'barca'
  | 'apophisStrong'
  | 'finish'

export type BoardCell = {
  index: number
  x: number
  y: number
  type: BoardCellType
  label: string
  move?: number
  skip?: boolean
  extraTurn?: boolean
  shield?: boolean
  reset?: boolean
}

// Coordenadas percentuais aproximadas sobre o tabuleiro original.
// A calibração fina deve ser feita depois olhando o jogo renderizado.
export const BOARD_PATH: BoardCell[] = [
  { index: 0, x: 11, y: 13, type: 'start', label: 'Pôr do Sol' },
  { index: 1, x: 24, y: 13, type: 'normal', label: 'Duat' },
  { index: 2, x: 42, y: 13, type: 'energy', label: 'Energia +3', move: 3 },
  { index: 3, x: 61, y: 13, type: 'normal', label: 'Duat' },
  { index: 4, x: 82, y: 15, type: 'apophis', label: 'Apófis -5', move: -5 },
  { index: 5, x: 87, y: 26, type: 'chains', label: 'Correntes -3', move: -3 },
  { index: 6, x: 78, y: 34, type: 'darkness', label: 'Escuridão', skip: true },
  { index: 7, x: 62, y: 34, type: 'normal', label: 'Duat' },
  { index: 8, x: 46, y: 33, type: 'eye', label: 'Olho de Rá', shield: true },
  { index: 9, x: 31, y: 33, type: 'normal', label: 'Duat' },
  { index: 10, x: 17, y: 35, type: 'darkness', label: 'Escuridão', skip: true },
  { index: 11, x: 10, y: 43, type: 'gods', label: 'Deuses', extraTurn: true },
  { index: 12, x: 17, y: 52, type: 'normal', label: 'Duat' },
  { index: 13, x: 31, y: 54, type: 'fire', label: 'Fogo -1', move: -1 },
  { index: 14, x: 45, y: 54, type: 'path', label: 'Caminho +3', move: 3 },
  { index: 15, x: 59, y: 54, type: 'labyrinth', label: 'Labirinto', skip: true },
  { index: 16, x: 75, y: 55, type: 'normal', label: 'Duat' },
  { index: 17, x: 86, y: 62, type: 'barca', label: 'Barca +2', move: 2 },
  { index: 18, x: 80, y: 71, type: 'apophis', label: 'Apófis -5', move: -5 },
  { index: 19, x: 65, y: 72, type: 'energy', label: 'Energia +3', move: 3 },
  { index: 20, x: 50, y: 72, type: 'darkness', label: 'Escuridão', skip: true },
  { index: 21, x: 35, y: 71, type: 'energy', label: 'Energia +3', move: 3 },
  { index: 22, x: 18, y: 71, type: 'chains', label: 'Correntes -3', move: -3 },
  { index: 23, x: 10, y: 80, type: 'eye', label: 'Olho de Rá', shield: true },
  { index: 24, x: 13, y: 90, type: 'chains', label: 'Correntes -3', move: -3 },
  { index: 25, x: 30, y: 90, type: 'gods', label: 'Deuses', extraTurn: true },
  { index: 26, x: 45, y: 90, type: 'apophisStrong', label: 'Apófis Forte', reset: true },
  { index: 27, x: 60, y: 90, type: 'normal', label: 'Duat' },
  { index: 28, x: 76, y: 90, type: 'finish', label: 'Nascer do Sol' }
]
