import Phaser from 'phaser'
import GameConfig from './config/GameConfig'

import BootScene from './scenes/BootScene'
import PreloadScene from './scenes/PreloadScene'
import WorldScene from './scenes/WorldScene'
import CombatScene from './scenes/CombatScene'
import InventoryScene from './scenes/InventoryScene'
import TestScene from './scenes/TestScene'

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
        BootScene,
        PreloadScene,
        WorldScene,
        CombatScene,
        InventoryScene,
        TestScene
    ]
}

// MODE TEST → lance directement TestScene
// MODE PROD → lance BootScene
export const createGame = (testMode = false) => {
    const gameConfig = {
        ...config,
        scene: testMode
            ? [TestScene]
            : [BootScene, PreloadScene, WorldScene, CombatScene, InventoryScene]
    }
    return new Phaser.Game(gameConfig)
}