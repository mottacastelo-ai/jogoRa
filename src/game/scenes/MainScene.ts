import Phaser from 'phaser'
import { BOARD_PATH } from '../data/boardPath'
import {
  applyCellEffect,
  createInitialGameState,
  getNextPlayerIndex,
  rollDice
} from '../systems/gameState'

export class MainScene extends Phaser.Scene {
  private pieces: Phaser.GameObjects.Container[] = []

  private state = createInitialGameState()

  private infoText!: Phaser.GameObjects.Text

  private currentText!: Phaser.GameObjects.Text

  private diceText!: Phaser.GameObjects.Text

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image(
      'board',
      '/jogoRa/public/assets/board/tabuleiro-original.jpeg'
    )
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    const board = this.add.image(width / 2, height / 2, 'board')

    board.setDisplaySize(width * 0.95, height * 0.95)

    BOARD_PATH.forEach((cell) => {
      const marker = this.add.circle(
        (cell.x / 100) * width,
        (cell.y / 100) * height,
        10,
        0xffffff,
        0.14
      )

      marker.setStrokeStyle(2, 0xffd166, 0.35)
    })

    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f]

    this.state.players.forEach((player, index) => {
      const start = BOARD_PATH[0]

      const glow = this.add.circle(0, 0, 18, colors[index], 0.25)
      const body = this.add.circle(0, 0, 12, colors[index])

      body.setStrokeStyle(3, 0xffffff)

      const piece = this.add.container(
        (start.x / 100) * width + index * 18,
        (start.y / 100) * height,
        [glow, body]
      )

      this.tweens.add({
        targets: piece,
        scale: 1.08,
        duration: 800,
        yoyo: true,
        repeat: -1
      })

      this.pieces.push(piece)
    })

    this.currentText = this.add.text(36, 24, '', {
      fontSize: '30px',
      color: '#ffe8a3'
    })

    this.diceText = this.add.text(36, 70, '🎲 --', {
      fontSize: '28px',
      color: '#ffffff'
    })

    this.infoText = this.add.text(36, 118, this.state.message, {
      fontSize: '22px',
      color: '#ffe7b3',
      wordWrap: {
        width: 420
      }
    })

    const button = this.add.rectangle(width - 170, 80, 250, 72, 0x1f2f4f)

    button.setStrokeStyle(3, 0xffd166)
    button.setInteractive({ useHandCursor: true })

    const label = this.add.text(button.x, button.y, 'ROLAR DADO', {
      fontSize: '28px',
      color: '#ffe9b5'
    })

    label.setOrigin(0.5)

    button.on('pointerdown', () => {
      this.handleTurn()
    })

    this.updateUI()
  }

  private handleTurn() {
    if (this.state.winnerId !== null) return

    const currentPlayer =
      this.state.players[this.state.currentPlayerIndex]

    if (currentPlayer.skipNextTurn) {
      currentPlayer.skipNextTurn = false
      this.state.message = `${currentPlayer.name} perdeu esta rodada.`
      this.state.currentPlayerIndex = getNextPlayerIndex(this.state)
      this.updateUI()
      return
    }

    const dice = rollDice()

    this.state.lastDice = dice

    currentPlayer.position = Math.min(
      BOARD_PATH.length - 1,
      currentPlayer.position + dice
    )

    const targetCell = BOARD_PATH[currentPlayer.position]

    this.movePiece(currentPlayer.id, targetCell.x, targetCell.y)

    const message = applyCellEffect(
      currentPlayer,
      targetCell,
      BOARD_PATH.length
    )

    this.state.message = `${currentPlayer.name} tirou ${dice}. ${message}`

    if (currentPlayer.position >= BOARD_PATH.length - 1) {
      this.state.winnerId = currentPlayer.id
      this.state.message = `${currentPlayer.name} venceu A Jornada Noturna de Rá.`
    }

    if (!targetCell.extraTurn && this.state.winnerId === null) {
      this.state.currentPlayerIndex = getNextPlayerIndex(this.state)
    }

    this.updateUI()
  }

  private movePiece(id: number, xPercent: number, yPercent: number) {
    const width = this.scale.width
    const height = this.scale.height

    const piece = this.pieces[id]

    this.tweens.add({
      targets: piece,
      x: (xPercent / 100) * width + id * 18,
      y: (yPercent / 100) * height,
      duration: 600,
      ease: 'Sine.easeInOut'
    })
  }

  private updateUI() {
    const player = this.state.players[this.state.currentPlayerIndex]

    this.currentText.setText(`Vez de: ${player.name}`)

    this.diceText.setText(
      `🎲 ${this.state.lastDice ?? '--'}`
    )

    this.infoText.setText(this.state.message)
  }
}
