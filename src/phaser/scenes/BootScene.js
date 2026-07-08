import Phaser from 'phaser'
import { store } from '../../app/store'

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene')
    }

    create() {
        const gameState = store.getState().game

        if (gameState.isPlaying) {
            // Reprend une partie en cours
            this.scene.start('PreloadScene', {
                mapId:  gameState.mapId,
                posX:   gameState.posX,
                posY:   gameState.posY,
            })
        } else {
            // Nouvelle partie → Dashboard
            // Le jeu ne devrait pas démarrer sans save active
            console.warn('Aucune partie active — retour au dashboard')
        }
    }
}