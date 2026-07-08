import Phaser from 'phaser'
import GameConfig from '../config/GameConfig';
import InputManager from '../managers/InputManager';
import MapManager from '../managers/MapManager';
import TriggerManager from '../managers/TriggerManager';
import PlayerManager from '../managers/PlayerManager';

export default class TestScene extends Phaser.Scene {

    constructor() {
        super('TestScene')
    }

    preload() {
        const mapId = 'zone_test'
        MapManager.preload(this, mapId)

        // Délègue le preload au PlayerManager
        this.playerManager = new PlayerManager(this)
        this.playerManager.preload(this)
    }

    create() {

        // Joueur
        this.playerManager.create(200, 200)
        
        // Map
        this.mapManager = new MapManager(this)
        this.mapManager
            .loadMap('zone_test')
            .setupCamera(this.playerManager.getSprite())
            .addCollider(this.playerManager.getSprite())

        // TriggerManager
        this.triggerManager = new TriggerManager(this, this.playerManager.getSprite())
        this.triggerManager
            .on('combat', (data) => {
                // console.log('Combat déclenché !', data)
                // Pause TestScene et lance CombatScene par dessus
                this.scene.pause('TestScene')
                this.scene.launch('BattleScene', data)
            })
            .on('map_transition', (data) => {
                console.log('Transition vers', data.targetMap)
                // Plus tard : changer de map
            })
            .on('dialogue', (data) => {
                console.log('Dialogue', data.dialogueId)
                // Plus tard : this.scene.launch('DialogueScene', data)
            })
            .on('event', (data) => {
                console.log('Événement', data.eventId)
            })

        // Input
        this.inputManager = new InputManager(this)

        //this.cursors = this.input.keyboard.createCursorKeys()
        this.scale.on('resize', this.resize, this)
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