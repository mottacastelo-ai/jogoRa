import type { BoardCell } from '../data/boardPath'

export type PlayerState = {
  id: number
  name: string
  position: number
  shields: number
  skipNextTurn: boolean
}

export type GameState = {
  players: PlayerState[]
  currentPlayerIndex: number
  winnerId: number | null
  lastDice: number | null
  message: string
}

export const createInitialGameState = (playerCount = 4): GameState => ({
  players: Array.from({ length: playerCount }, (_, index) => ({
    id: index,
    name: `Jogador ${index + 1}`,
    position: 0,
    shields: 0,
    skipNextTurn: false
  })),
  currentPlayerIndex: 0,
  winnerId: null,
  lastDice: null,
  message: 'A jornada começou. Role o dado para avançar pela Duat.'
})

export const rollDice = () => Math.floor(Math.random() * 6) + 1

export const getNextPlayerIndex = (state: GameState) =>
  (state.currentPlayerIndex + 1) % state.players.length

export const applyCellEffect = (
  player: PlayerState,
  cell: BoardCell,
  pathLength: number
): string => {
  if (cell.type === 'normal' || cell.type === 'start' || cell.type === 'finish') {
    return `${player.name} chegou em ${cell.label}.`
  }

  const isNegative = Boolean(cell.move && cell.move < 0) || cell.skip || cell.reset

  if (isNegative && player.shields > 0) {
    player.shields -= 1
    return `${player.name} usou o Olho de Rá e ignorou o perigo: ${cell.label}.`
  }

  if (cell.shield) {
    player.shields += 1
    return `${player.name} encontrou o Olho de Rá e ganhou uma proteção.`
  }

  if (cell.reset) {
    player.position = 0
    return `${player.name} encontrou Apófis Forte e voltou ao início.`
  }

  if (cell.skip) {
    player.skipNextTurn = true
    return `${player.name} caiu em ${cell.label} e perderá a próxima rodada.`
  }

  if (cell.move) {
    player.position = Math.max(0, Math.min(pathLength - 1, player.position + cell.move))
    const direction = cell.move > 0 ? 'avançou' : 'voltou'
    return `${player.name} caiu em ${cell.label} e ${direction} para a casa ${player.position}.`
  }

  if (cell.extraTurn) {
    return `${player.name} recebeu ajuda dos deuses e joga novamente.`
  }

  return `${player.name} chegou em ${cell.label}.`
}
