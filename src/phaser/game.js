import Phaser from 'phaser'
import GameConfig from './config/GameConfig'
import MainScene from './scenes/MainScene'

const config = {
    type: Phaser.AUTO,

    width: GameConfig.WIDTH,
    height: GameConfig.HEIGHT,

    parent: 'game-container',

    backgroundColor: '#000000',

    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        MainScene
    ]
}

export const createGame = () => {
  return new Phaser.Game(config)
}