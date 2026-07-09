import Phaser from 'phaser'
import { store } from '../../app/store'
import { updatePosition } from '../../features/game/gameSlice'
import MapManager from '../managers/MapManager'
import PlayerManager from '../managers/PlayerManager'
import InputManager from '../managers/InputManager'
import TriggerManager from '../managers/TriggerManager'
import GameConfig from '../config/GameConfig'

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene')
    }

    init(data) {
        this.mapId  = data?.mapId ?? 'zone_test'
        this.spawnX = data?.posX  ?? 200
        this.spawnY = data?.posY  ?? 200
    }

    preload() {
        // Précharge la map
        MapManager.preload(this, this.mapId)

        // Précharge le joueur ici !
        this.playerManager = new PlayerManager(this)
        this.playerManager.preload(this)
    }

    create() {
        // Joueur
        this.playerManager.create(this.spawnX, this.spawnY)

        // Map
        this.mapManager = new MapManager(this)
        this.mapManager
            .loadMap(this.mapId)
            .setupCamera(this.playerManager.getSprite())
            .addCollider(this.playerManager.getSprite())

        // Input
        this.inputManager = new InputManager(this)

        // Triggers
        this.triggerManager = new TriggerManager(this, this.playerManager.getSprite())
        this.triggerManager
            .on('combat', (data) => {
                this.scene.pause('WorldScene')
                this.scene.launch('BattleScene', data)
            })
            .on('map_transition', (data) => {
                this.changeMap(data.targetMap, data.spawnPoint)
            })
            .on('dialogue', (data) => {
                // Plus tard
                console.log('Dialogue', data.dialogueId)
            })

        // Sauvegarde position toutes les 5 secondes
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: this.savePosition,
            callbackScope: this
        })

        this.scale.on('resize', this.resize, this)
    }

    savePosition() {
        store.dispatch(updatePosition({
            x: Math.round(this.playerManager.getX()),
            y: Math.round(this.playerManager.getY()),
        }))
    }

    changeMap(mapId, spawnPoint) {
        // Recharge la scène avec la nouvelle map
        this.scene.restart({ mapId, spawnPoint })
    }

    resize(gameSize) {
        const { width, height } = gameSize
        this.cameras.main.setViewport(0, 0, width, height)
    }

    update() {
        this.playerManager.update(this.inputManager, GameConfig.PLAYER_SPEED)
        this.triggerManager.update(this.mapManager.layers.triggers)
    }
}