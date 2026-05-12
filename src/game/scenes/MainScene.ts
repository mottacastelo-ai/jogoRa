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
  private eventTitle!: Phaser.GameObjects.Text
  private shieldText!: Phaser.GameObjects.Text
  private rollButton!: Phaser.GameObjects.Rectangle
  private rolling = false

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image('board', '/jogoRa/assets/board/tabuleiro-original.jpeg')
    this.load.image('pieces', '/jogoRa/assets/pieces/pecas-originais.jpeg')
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070d)
    this.add.circle(width * 0.5, height * 0.5, 560, 0xd79a2b, 0.08)

    const board = this.add.image(width * 0.5, height * 0.53, 'board')
    board.setDisplaySize(width * 0.72, height * 0.88)

    this.createHud(width, height)
    this.createPathMarkers(width, height)
    this.createPieces(width, height)
    this.createRollButton(width, height)

    this.updateUI()
  }

  private createHud(width: number, height: number) {
    this.add.rectangle(220, 92, 390, 138, 0x10152a, 0.82)
      .setStrokeStyle(2, 0xffd166, 0.32)

    this.add.text(42, 34, 'A Jornada Noturna de Rá', {
      fontSize: '28px',
      color: '#ffd77a',
      fontStyle: 'bold'
    })

    this.currentText = this.add.text(42, 78, '', {
      fontSize: '22px',
      color: '#ffe8a3'
    })

    this.diceText = this.add.text(42, 112, '🎲 --', {
      fontSize: '26px',
      color: '#ffffff'
    })

    this.add.rectangle(width - 235, height - 120, 410, 150, 0x10152a, 0.84)
      .setStrokeStyle(2, 0xffd166, 0.34)

    this.eventTitle = this.add.text(width - 420, height - 176, 'Evento', {
      fontSize: '18px',
      color: '#ffd77a',
      fontStyle: 'bold'
    })

    this.infoText = this.add.text(width - 420, height - 142, this.state.message, {
      fontSize: '18px',
      color: '#ffe7b3',
      wordWrap: { width: 350 }
    })

    this.shieldText = this.add.text(width - 420, height - 48, '', {
      fontSize: '16px',
      color: '#b7e4ff'
    })
  }

  private createPathMarkers(width: number, height: number) {
    BOARD_PATH.forEach((cell) => {
      const marker = this.add.circle(
        (cell.x / 100) * width,
        (cell.y / 100) * height,
        cell.type === 'finish' || cell.type === 'start' ? 13 : 9,
        this.getCellColor(cell.type),
        0.22
      )

      marker.setStrokeStyle(2, 0xffd166, 0.5)
    })
  }

  private createPieces(width: number, height: number) {
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f]
    const symbols = ['☀', '𓂀', '☥', '★']

    this.state.players.forEach((player, index) => {
      const start = BOARD_PATH[0]
      const glow = this.add.circle(0, 0, 26, colors[index], 0.22)
      const body = this.add.circle(0, 0, 17, colors[index])
      const symbol = this.add.text(0, -1, symbols[index], {
        fontSize: '19px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      body.setStrokeStyle(3, 0xffffff)

      const piece = this.add.container(
        (start.x / 100) * width + index * 19,
        (start.y / 100) * height,
        [glow, body, symbol]
      )

      piece.setDepth(20)

      this.tweens.add({
        targets: piece,
        scale: 1.08,
        duration: 850,
        yoyo: true,
        repeat: -1
      })

      this.pieces.push(piece)
    })
  }

  private createRollButton(width: number, _height: number) {
    this.rollButton = this.add.rectangle(width - 175, 82, 260, 78, 0x23385f)
    this.rollButton.setStrokeStyle(3, 0xffd166)
    this.rollButton.setInteractive({ useHandCursor: true })

    const label = this.add.text(this.rollButton.x, this.rollButton.y, 'ROLAR DADO', {
      fontSize: '27px',
      color: '#ffe9b5',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.rollButton.on('pointerover', () => {
      this.rollButton.setFillStyle(0x315083)
      label.setScale(1.04)
    })

    this.rollButton.on('pointerout', () => {
      this.rollButton.setFillStyle(0x23385f)
      label.setScale(1)
    })

    this.rollButton.on('pointerdown', () => this.handleTurn())
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

    currentPlayer.position = Math.min(BOARD_PATH.length - 1, currentPlayer.position + dice)
    const targetCell = BOARD_PATH[currentPlayer.position]

    this.movePiece(currentPlayer.id, targetCell.x, targetCell.y)

    const message = applyCellEffect(currentPlayer, targetCell, BOARD_PATH.length)
    this.state.message = `${currentPlayer.name} tirou ${dice}. ${message}`

    this.playCellEffect(targetCell.type)

    if (currentPlayer.position >= BOARD_PATH.length - 1) {
      this.state.winnerId = currentPlayer.id
      this.state.message = `${currentPlayer.name} venceu A Jornada Noturna de Rá. O sol nasceu!`
      this.playVictoryEffect()
    }

    if (!targetCell.extraTurn && this.state.winnerId === null) {
      this.state.currentPlayerIndex = getNextPlayerIndex(this.state)
    }

    this.updateUI()
  }

  private animateDice(onDone: () => void) {
    let ticks = 0
    const timer = this.time.addEvent({
      delay: 70,
      repeat: 9,
      callback: () => {
        ticks += 1
        this.diceText.setText(`🎲 ${rollDice()}`)
        this.diceText.setScale(1 + Math.sin(ticks) * 0.08)
        if (ticks >= 10) {
          this.diceText.setScale(1)
          timer.remove(false)
          onDone()
        }
      }
    })
  }

  private movePiece(id: number, xPercent: number, yPercent: number) {
    const width = this.scale.width
    const height = this.scale.height
    const piece = this.pieces[id]

    this.tweens.add({
      targets: piece,
      x: (xPercent / 100) * width + id * 19,
      y: (yPercent / 100) * height,
      duration: 760,
      ease: 'Sine.easeInOut'
    })
  }

  private playCellEffect(type: string) {
    const width = this.scale.width
    const height = this.scale.height
    const color = this.getCellColor(type)
    const flash = this.add.circle(width / 2, height / 2, 60, color, 0.18)
    flash.setDepth(30)

    this.tweens.add({
      targets: flash,
      radius: 520,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    })
  }

  private playVictoryEffect() {
    const width = this.scale.width
    const height = this.scale.height

    const sun = this.add.circle(width / 2, height / 2, 70, 0xffd166, 0.42)
    sun.setDepth(40)

    this.tweens.add({
      targets: sun,
      radius: 700,
      alpha: 0,
      duration: 1800,
      ease: 'Cubic.easeOut',
      onComplete: () => sun.destroy()
    })
  }

  private updateUI() {
    const player = this.state.players[this.state.currentPlayerIndex]
    this.currentText.setText(`Vez de: ${player.name}`)
    this.diceText.setText(`🎲 ${this.state.lastDice ?? '--'}`)
    this.infoText.setText(this.state.message)
    this.eventTitle.setText(this.state.winnerId === null ? 'Evento' : 'Vitória')
    this.shieldText.setText(
      this.state.players
        .map((p) => `${p.name}: Olho de Rá ${p.shields}`)
        .join('  •  ')
    )
  }

  private getCellColor(type: string) {
    const colors: Record<string, number> = {
      start: 0xffd166,
      normal: 0xffffff,
      energy: 0x2ecc71,
      apophis: 0xe74c3c,
      chains: 0x9b59b6,
      darkness: 0x1b1b3a,
      gods: 0xf1c40f,
      eye: 0x4cc9f0,
      fire: 0xff7b00,
      path: 0x8be36b,
      labyrinth: 0x8e44ad,
      barca: 0x3498db,
      apophisStrong: 0xc0392b,
      finish: 0xffd166
    }

    return colors[type] ?? 0xffffff
  }
}
