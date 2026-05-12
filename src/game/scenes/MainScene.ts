import Phaser from 'phaser'
import { BOARD_PATH } from '../data/boardPath'
import { PLAYER_COLORS } from '../data/gameConfig'
import {
  applyCellEffect,
  createInitialGameState,
  getNextPlayerIndex,
  rollDice
} from '../systems/gameState'

const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path}`

export class MainScene extends Phaser.Scene {
  private pieces: Phaser.GameObjects.Container[] = []
  private state = createInitialGameState()
  private infoText!: Phaser.GameObjects.Text
  private currentText!: Phaser.GameObjects.Text
  private diceText!: Phaser.GameObjects.Text
  private rolling = false

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image('board', assetPath('assets/board/tabuleiro-original.jpeg'))
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    this.add.rectangle(width / 2, height / 2, width, height, 0x15110b)

    const board = this.add.image(width / 2, height / 2, 'board')
    board.setDisplaySize(width * 0.72, height * 0.92)
    board.setDepth(1)

    this.createPieces(width, height)
    this.createMinimalHud(width, height)
    this.updateUI()
  }

  private createMinimalHud(width: number, height: number) {
    const panel = this.add.rectangle(width / 2, height - 58, width * 0.86, 78, 0x120d08, 0.82)
    panel.setStrokeStyle(2, 0xe0b45c, 0.72)
    panel.setDepth(50)

    this.currentText = this.add.text(44, height - 84, '', {
      fontSize: '22px',
      color: '#ffe3a3',
      fontStyle: 'bold'
    })
    this.currentText.setDepth(51)

    this.diceText = this.add.text(44, height - 50, '', {
      fontSize: '20px',
      color: '#fff2c7'
    })
    this.diceText.setDepth(51)

    this.infoText = this.add.text(240, height - 70, this.state.message, {
      fontSize: '18px',
      color: '#fff2c7',
      wordWrap: { width: width * 0.48 }
    })
    this.infoText.setDepth(51)

    const button = this.add.rectangle(width - 150, height - 58, 220, 48, 0x3a2a14, 0.96)
    button.setStrokeStyle(2, 0xe0b45c, 0.9)
    button.setInteractive({ useHandCursor: true })
    button.setDepth(51)

    const label = this.add.text(width - 150, height - 58, 'Rolar dado', {
      fontSize: '20px',
      color: '#ffe3a3',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    label.setDepth(52)

    button.on('pointerdown', () => this.handleTurn())
  }

  private createPieces(width: number, height: number) {
    this.state.players.forEach((player, index) => {
      const start = BOARD_PATH[0]
      const rim = this.add.circle(0, 0, 18, 0xf8df9a, 0.24)
      const base = this.add.circle(0, 0, 15, PLAYER_COLORS[index], 0.96)
      const label = this.add.text(0, 0, String(index + 1), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      base.setStrokeStyle(2, 0xfff0c4)

      const piece = this.add.container(
        (start.x / 100) * width + index * 18,
        (start.y / 100) * height,
        [rim, base, label]
      )
      piece.setDepth(30)
      this.pieces.push(piece)
    })
  }

  private handleTurn() {
    if (this.state.winnerId !== null || this.rolling) return

    this.rolling = true
    this.animateDice(() => {
      this.executeTurn()
      this.rolling = false
    })
  }

  private executeTurn() {
    const currentPlayer = this.state.players[this.state.currentPlayerIndex]

    if (currentPlayer.skipNextTurn) {
      currentPlayer.skipNextTurn = false
      this.state.message = `${currentPlayer.name} perdeu esta rodada.`
      this.state.currentPlayerIndex = getNextPlayerIndex(this.state)
      this.updateUI()
      return
    }

    const dice = rollDice()
    this.state.lastDice = dice

    const from = currentPlayer.position
    const to = Math.min(BOARD_PATH.length - 1, currentPlayer.position + dice)
    currentPlayer.position = to

    this.movePieceAlongPath(currentPlayer.id, from, to, () => {
      const targetCell = BOARD_PATH[currentPlayer.position]
      const message = applyCellEffect(currentPlayer, targetCell, BOARD_PATH.length)
      this.state.message = `${currentPlayer.name} tirou ${dice}. ${message}`

      if (currentPlayer.position >= BOARD_PATH.length - 1) {
        this.state.winnerId = currentPlayer.id
        this.state.message = `${currentPlayer.name} venceu. O sol nasceu!`
      }

      const finalCell = BOARD_PATH[currentPlayer.position]
      this.movePiece(currentPlayer.id, finalCell.x, finalCell.y, 180)

      if (!targetCell.extraTurn && this.state.winnerId === null) {
        this.state.currentPlayerIndex = getNextPlayerIndex(this.state)
      }

      this.updateUI()
    })
  }

  private animateDice(onDone: () => void) {
    let ticks = 0
    const timer = this.time.addEvent({
      delay: 70,
      repeat: 8,
      callback: () => {
        ticks += 1
        this.diceText.setText(`Dado: ${rollDice()}`)
        if (ticks >= 9) {
          timer.remove(false)
          onDone()
        }
      }
    })
  }

  private movePieceAlongPath(id: number, from: number, to: number, onComplete: () => void) {
    const steps: number[] = []
    for (let i = from + 1; i <= to; i += 1) steps.push(i)

    if (steps.length === 0) {
      onComplete()
      return
    }

    const runStep = (stepIndex: number) => {
      const cell = BOARD_PATH[steps[stepIndex]]
      this.movePiece(id, cell.x, cell.y, 220, () => {
        if (stepIndex >= steps.length - 1) onComplete()
        else runStep(stepIndex + 1)
      })
    }

    runStep(0)
  }

  private movePiece(
    id: number,
    xPercent: number,
    yPercent: number,
    duration = 520,
    onComplete?: () => void
  ) {
    const width = this.scale.width
    const height = this.scale.height
    const piece = this.pieces[id]

    this.tweens.add({
      targets: piece,
      x: (xPercent / 100) * width + id * 18,
      y: (yPercent / 100) * height,
      duration,
      ease: 'Sine.easeInOut',
      onComplete
    })
  }

  private updateUI() {
    const player = this.state.players[this.state.currentPlayerIndex]
    this.currentText.setText(`Vez: ${player.name}`)
    this.diceText.setText(`Dado: ${this.state.lastDice ?? '-'}`)
    this.infoText.setText(this.state.message)
  }
}
