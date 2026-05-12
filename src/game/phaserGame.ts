import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene'

export const createGame = (container: HTMLDivElement) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: '#05070d',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1200,
      height: 900
    },
    scene: [MainScene]
  })
}
