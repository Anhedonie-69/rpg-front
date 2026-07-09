import Phaser from 'phaser'
import MapManager from '../managers/MapManager'
import MapConfig from '../config/MapConfig'

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene')
    }

    init(data) {
        this.gameState = data?.gameState
    }

    preload() {
        // Précharge les assets selon la map
        const mapId = this.gameState?.mapId ?? MapConfig.defaultMap
        MapManager.preload(this, mapId)
    }

    create() {
        this.scene.start('WorldScene', {
            mapId: this.gameState?.mapId ?? MapConfig.defaultMap,
            posX:  this.gameState?.posX  ?? MapConfig.defaultX,
            posY:  this.gameState?.posY  ?? MapConfig.defaultY,
        })
    }
}