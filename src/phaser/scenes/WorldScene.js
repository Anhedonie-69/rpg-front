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
        // Reçoit les données de la save
        this.saveData = data ?? store.getState().game
    }

    preload() {
        // Assets dynamiques selon la map
        const mapId = this.saveData?.mapId ?? 'zone_test'
        MapManager.preload(this, mapId)

        // Joueur si pas déjà chargé par PreloadScene
        if (!this.textures.exists('player_idle')) {
            this.playerManager = new PlayerManager(this)
            this.playerManager.preload(this)
        }
    }

    create() {
        const mapId  = this.saveData?.mapId ?? 'zone_test'
        const spawnX = this.saveData?.posX  ?? 200
        const spawnY = this.saveData?.posY  ?? 200

        // Map
        this.mapManager = new MapManager(this)
        this.mapManager.loadMap(mapId)

        // Joueur
        this.playerManager = this.playerManager ?? new PlayerManager(this)
        this.playerManager.create(spawnX, spawnY)

        // Caméra et collisions
        this.mapManager
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