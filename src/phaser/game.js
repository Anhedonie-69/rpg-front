import Phaser from 'phaser'
import GameConfig from './config/GameConfig'

import BootScene from './scenes/BootScene'
import PreloadScene from './scenes/PreloadScene'
import WorldScene from './scenes/WorldScene'
import BattleScene from './scenes/BattleScene'
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
            //debug: true
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
        BattleScene,
        InventoryScene,
        TestScene
    ]
}

// MODE TEST → lance directement TestScene
// MODE PROD → lance BootScene
export const createGame = (testMode = false, gameState = null) => {
    const gameConfig = {
        ...config,
        scene: testMode
            ? [TestScene, BattleScene]
            : [BootScene, PreloadScene, WorldScene, BattleScene, InventoryScene]
    }
    const game = new Phaser.Game(gameConfig)

    // Passe gameState directement sans attendre 'ready'
    if (!testMode && gameState) {
        game.scene.start('BootScene', { gameState })
    }

    return game
}