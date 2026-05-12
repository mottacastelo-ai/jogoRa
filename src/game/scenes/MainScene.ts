import Phaser from 'phaser'
import { BOARD_PATH } from '../data/boardPath'

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.image(
      'board',
      '/jogoRa/public/assets/board/tabuleiro-original.jpeg'
    )

    this.load.image(
      'pieces',
      '/jogoRa/public/assets/pieces/pecas-originais.jpeg'
    )
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    const board = this.add.image(width / 2, height / 2, 'board')

    board.setDisplaySize(width * 0.95, height * 0.95)

    const playerColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f]

    BOARD_PATH.forEach((cell) => {
      const marker = this.add.circle(
        (cell.x / 100) * width,
        (cell.y / 100) * height,
        10,
        0xffffff,
        0.12
      )

      marker.setStrokeStyle(2, 0xffd166, 0.4)
    })

    playerColors.forEach((color, index) => {
      const start = BOARD_PATH[0]

      const piece = this.add.circle(
        (start.x / 100) * width + index * 16,
        (start.y / 100) * height,
        14,
        color
      )

      piece.setStrokeStyle(3, 0xffffff)

      this.tweens.add({
        targets: piece,
        scale: 1.08,
        duration: 900,
        yoyo: true,
        repeat: -1
      })
    })

    this.add.text(40, 40, 'A Jornada Noturna de Rá', {
      fontSize: '32px',
      color: '#ffe29a'
    })
  }
}
