import Phaser from 'phaser'
import InputManager from '../managers/InputManager'

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene')
    }

    init(data) {
        // Reçoit les données de la save au démarrage
        this.saveData = data
    }

    preload() {
        // Les assets sont déjà chargés par PreloadScene
    }

    create() {
        // TODO : charger la tilemap
        // TODO : créer le joueur animé
        // TODO : configurer la caméra
        // TODO : configurer les triggers de combat
    }

    update() {
        // TODO : déplacements, collisions
    }
}