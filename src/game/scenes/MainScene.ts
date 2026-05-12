import Phaser from 'phaser'
import { BOARD_PATH } from '../data/boardPath'
import { DANGER_CELL_TYPES, PLAYER_COLORS, PLAYER_SYMBOLS } from '../data/gameConfig'
import { AudioSystem } from '../systems/audio'
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
  private audio = new AudioSystem()
  private infoText!: Phaser.GameObjects.Text
  private currentText!: Phaser.GameObjects.Text
  private diceText!: Phaser.GameObjects.Text
  private eventTitle!: Phaser.GameObjects.Text
  private shieldText!: Phaser.GameObjects.Text
  private rollButton!: Phaser.GameObjects.Rectangle
  private startOverlay!: Phaser.GameObjects.Container
  private rolling = false
  private started = false

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image('board', assetPath('assets/board/tabuleiro-original.jpeg'))
    this.load.image('pieces', assetPath('assets/pieces/pecas-originais.jpeg'))
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070d)
    this.createAtmosphere(width, height)

    const board = this.add.image(width * 0.5, height * 0.53, 'board')
    board.setDisplaySize(width * 0.72, height * 0.88)
    board.setDepth(1)

    this.createHud(width, height)
    this.createPathMarkers(width, height)
    this.createPieces(width, height)
    this.createRollButton(width, height)
    this.createAssetPreview(width, height)
    this.createStartOverlay(width, height)

    this.updateUI()
  }

  private createStartOverlay(width: number, height: number) {
    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x02030a, 0.82)
    const card = this.add.rectangle(width / 2, height / 2, 720, 420, 0x10152a, 0.96)
    card.setStrokeStyle(3, 0xffd166, 0.55)

    const sun = this.add.circle(width / 2, height / 2 - 156, 58, 0xffd166, 0.32)
    const title = this.add.text(width / 2, height / 2 - 92, 'A Jornada Noturna de Rá', {
      fontSize: '46px',
      color: '#ffd77a',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const subtitle = this.add.text(width / 2, height / 2 - 28, 'Atravesse a Duat, enfrente Apófis e faça o sol nascer.', {
      fontSize: '22px',
      color: '#ffe8b4'
    }).setOrigin(0.5)

    const startButton = this.add.rectangle(width / 2, height / 2 + 82, 310, 82, 0x315083)
    startButton.setStrokeStyle(3, 0xffd166)
    startButton.setInteractive({ useHandCursor: true })

    const startLabel = this.add.text(width / 2, height / 2 + 82, 'INICIAR PARTIDA', {
      fontSize: '28px',
      color: '#fff0bf',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const hint = this.add.text(width / 2, height / 2 + 164, 'Versão premium inicial • 4 jogadores • turno local', {
      fontSize: '16px',
      color: '#b7e4ff'
    }).setOrigin(0.5)

    this.startOverlay = this.add.container(0, 0, [shade, card, sun, title, subtitle, startButton, startLabel, hint])
    this.startOverlay.setDepth(100)

    this.tweens.add({
      targets: sun,
      scale: 1.12,
      alpha: 0.58,
      duration: 1100,
      yoyo: true,
      repeat: -1
    })

    startButton.on('pointerdown', () => {
      this.started = true
      this.audio.playGood()
      this.tweens.add({
        targets: this.startOverlay,
        alpha: 0,
        duration: 550,
        ease: 'Sine.easeInOut',
        onComplete: () => this.startOverlay.destroy()
      })
    })
  }

  private createAtmosphere(width: number, height: number) {
    this.add.circle(width * 0.5, height * 0.5, 560, 0xd79a2b, 0.08)
    this.add.circle(width * 0.17, height * 0.18, 180, 0xffd166, 0.08)
    this.add.circle(width * 0.86, height * 0.18, 220, 0x315083, 0.16)

    for (let i = 0; i < 42; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(20, height - 20),
        Phaser.Math.FloatBetween(1, 2.8),
        0xffe8a3,
        Phaser.Math.FloatBetween(0.18, 0.58)
      )
      star.setDepth(0)
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.08, 0.32),
        duration: Phaser.Math.Between(900, 2200),
        yoyo: true,
        repeat: -1
      })
    }
  }

  private createHud(width: number, height: number) {
    this.add.rectangle(220, 92, 390, 138, 0x10152a, 0.82)
      .setStrokeStyle(2, 0xffd166, 0.32)
      .setDepth(40)

    this.add.text(42, 34, 'A Jornada Noturna de Rá', {
      fontSize: '28px',
      color: '#ffd77a',
      fontStyle: 'bold'
    }).setDepth(41)

    this.currentText = this.add.text(42, 78, '', {
      fontSize: '22px',
      color: '#ffe8a3'
    }).setDepth(41)

    this.diceText = this.add.text(42, 112, '🎲 --', {
      fontSize: '26px',
      color: '#ffffff'
    }).setDepth(41)

    this.add.rectangle(width - 235, height - 120, 410, 150, 0x10152a, 0.84)
      .setStrokeStyle(2, 0xffd166, 0.34)
      .setDepth(40)

    this.eventTitle = this.add.text(width - 420, height - 176, 'Evento', {
      fontSize: '18px',
      color: '#ffd77a',
      fontStyle: 'bold'
    }).setDepth(41)

    this.infoText = this.add.text(width - 420, height - 142, this.state.message, {
      fontSize: '18px',
      color: '#ffe7b3',
      wordWrap: { width: 350 }
    }).setDepth(41)

    this.shieldText = this.add.text(width - 420, height - 48, '', {
      fontSize: '16px',
      color: '#b7e4ff'
    }).setDepth(41)
  }

  private createAssetPreview(width: number, height: number) {
    const frame = this.add.rectangle(width - 140, height * 0.48, 210, 250, 0x10152a, 0.72)
    frame.setStrokeStyle(2, 0xffd166, 0.28)
    frame.setDepth(9)

    this.add.text(width - 230, height * 0.34, 'Peças originais', {
      fontSize: '18px',
      color: '#ffd77a',
      fontStyle: 'bold'
    }).setDepth(10)

    const pieces = this.add.image(width - 140, height * 0.49, 'pieces')
    pieces.setDisplaySize(170, 190)
    pieces.setDepth(10)
    pieces.setAlpha(0.9)
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
      marker.setDepth(12)
    })
  }

  private createPieces(width: number, height: number) {
    this.state.players.forEach((player, index) => {
      const start = BOARD_PATH[0]
      const glow = this.add.circle(0, 0, 30, PLAYER_COLORS[index], 0.32)
      const shadow = this.add.ellipse(0, 18, 44, 14, 0x000000, 0.28)
      const pedestal = this.add.rectangle(0, 10, 34, 16, PLAYER_COLORS[index], 0.95)
      const figure = this.add.triangle(0, -10, 0, -28, -18, 14, 18, 14, PLAYER_COLORS[index], 1)
      const head = this.add.circle(0, -28, 10, 0xffe1a8, 1)
      const symbol = this.add.text(0, 8, PLAYER_SYMBOLS[index], {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)

      pedestal.setStrokeStyle(2, 0xffffff)
      figure.setStrokeStyle(2, 0xffffff)
      head.setStrokeStyle(2, 0xffffff)

      const piece = this.add.container(
        (start.x / 100) * width + index * 19,
        (start.y / 100) * height,
        [shadow, glow, pedestal, figure, head, symbol]
      )

      piece.setDepth(25)

      this.tweens.add({
        targets: piece,
        y: piece.y - 6,
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      this.pieces.push(piece)
    })
  }

  private createRollButton(width: number, _height: number) {
    this.rollButton = this.add.rectangle(width - 175, 82, 260, 78, 0x23385f)
    this.rollButton.setStrokeStyle(3, 0xffd166)
    this.rollButton.setInteractive({ useHandCursor: true })
    this.rollButton.setDepth(40)

    const label = this.add.text(this.rollButton.x, this.rollButton.y, 'ROLAR DADO', {
      fontSize: '27px',
      color: '#ffe9b5',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    label.setDepth(41)

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
    if (!this.started || this.state.winnerId !== null || this.rolling) return

    this.rolling = true
    this.audio.playDice()
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
      this.playCellEffect(targetCell.type)
      this.showEventCard(targetCell.label, targetCell.type)

      if (currentPlayer.position >= BOARD_PATH.length - 1) {
        this.state.winnerId = currentPlayer.id
        this.state.message = `${currentPlayer.name} venceu A Jornada Noturna de Rá. O sol nasceu!`
        this.audio.playVictory()
        this.playVictoryEffect()
      }

      const finalCell = BOARD_PATH[currentPlayer.position]
      this.movePiece(currentPlayer.id, finalCell.x, finalCell.y, 260)

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

  private movePieceAlongPath(id: number, from: number, to: number, onComplete: () => void) {
    const steps: number[] = []
    for (let i = from + 1; i <= to; i += 1) steps.push(i)

    if (steps.length === 0) {
      onComplete()
      return
    }

    const runStep = (stepIndex: number) => {
      const cell = BOARD_PATH[steps[stepIndex]]
      this.audio.playStep()
      this.createStepParticles(id)
      this.movePiece(id, cell.x, cell.y, 230, () => {
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
    duration = 760,
    onComplete?: () => void
  ) {
    const width = this.scale.width
    const height = this.scale.height
    const piece = this.pieces[id]

    this.tweens.add({
      targets: piece,
      x: (xPercent / 100) * width + id * 19,
      y: (yPercent / 100) * height,
      duration,
      ease: 'Sine.easeInOut',
      onComplete
    })
  }

  private createStepParticles(id: number) {
    const piece = this.pieces[id]

    for (let i = 0; i < 5; i += 1) {
      const p = this.add.circle(
        piece.x + Phaser.Math.Between(-12, 12),
        piece.y + Phaser.Math.Between(8, 24),
        Phaser.Math.FloatBetween(2, 4),
        PLAYER_COLORS[id],
        0.75
      )
      p.setDepth(22)

      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-20, 20),
        y: p.y + Phaser.Math.Between(12, 28),
        alpha: 0,
        scale: 0.25,
        duration: Phaser.Math.Between(360, 620),
        ease: 'Sine.easeOut',
        onComplete: () => p.destroy()
      })
    }
  }

  private showEventCard(label: string, type: string) {
    const width = this.scale.width
    const height = this.scale.height
    const isDanger = DANGER_CELL_TYPES.includes(type)
    const color = isDanger ? 0x5b1020 : 0x123b30
    const border = isDanger ? 0xff6b6b : 0xffd166

    const bg = this.add.rectangle(width / 2, height * 0.17, 470, 118, color, 0.92)
    bg.setStrokeStyle(3, border, 0.88)
    bg.setDepth(70)

    const icon = isDanger ? '⚠' : '𓂀'
    const title = this.add.text(width / 2, height * 0.145, `${icon} ${label}`, {
      fontSize: '30px',
      color: '#fff2c7',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    title.setDepth(71)

    const sub = this.add.text(width / 2, height * 0.198, isDanger ? 'Perigo da Duat' : 'Ajuda divina', {
      fontSize: '18px',
      color: '#ffe8a3'
    }).setOrigin(0.5)
    sub.setDepth(71)

    const card = this.add.container(0, -28, [bg, title, sub])
    card.setDepth(70)
    card.setAlpha(0)

    this.tweens.add({
      targets: card,
      y: 0,
      alpha: 1,
      duration: 240,
      ease: 'Sine.easeOut',
      yoyo: true,
      hold: 900,
      onComplete: () => card.destroy()
    })
  }

  private playCellEffect(type: string) {
    const width = this.scale.width
    const height = this.scale.height
    const color = this.getCellColor(type)
    const isDanger = DANGER_CELL_TYPES.includes(type)

    if (isDanger) this.audio.playDanger()
    else this.audio.playGood()

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

    const glyphs = ['𓂀', '𓆣', '𓇳', '𓋹', '𓃭']
    for (let i = 0; i < 14; i += 1) {
      const glyph = this.add.text(
        width / 2 + Phaser.Math.Between(-90, 90),
        height / 2 + Phaser.Math.Between(-60, 60),
        Phaser.Utils.Array.GetRandom(glyphs),
        {
          fontSize: `${Phaser.Math.Between(18, 34)}px`,
          color: '#ffe8a3'
        }
      ).setOrigin(0.5)
      glyph.setDepth(31)

      this.tweens.add({
        targets: glyph,
        y: glyph.y - Phaser.Math.Between(70, 140),
        alpha: 0,
        scale: 1.4,
        duration: Phaser.Math.Between(700, 1200),
        ease: 'Cubic.easeOut',
        onComplete: () => glyph.destroy()
      })
    }

    if (isDanger) {
      this.cameras.main.shake(220, 0.006)
    }
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
