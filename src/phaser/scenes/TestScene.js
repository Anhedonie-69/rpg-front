import Phaser from 'phaser'
import GameConfig from '../config/GameConfig';
import InputManager from '../managers/InputManager';
import MapManager from '../managers/MapManager'

export default class TestScene extends Phaser.Scene {

    constructor() {
        super('TestScene')
    }

    preload() {
        // Charge le tileset (image PNG)
        this.load.image('tiles', '/assets/img/tiles/tiles.png')
        // Charge la map JSON exportée depuis Tiled
        this.load.tilemapTiledJSON('test', '/assets/img/maps/map_test.json')

        this.load.image('player', '/assets/pouce_benni2.png')
    }

    create() {

        const centerX = this.scale.width / 2
        const centerY = this.scale.height / 2

        // Joueur
        this.player = this.physics.add.sprite(centerX, centerY, 'player')
        this.player.setDepth(5)
        this.player.setCollideWorldBounds(true)

        // Map
        this.mapManager = new MapManager(this)
        this.mapManager
            .loadMap('test', 'tiles')
            .setupCamera(this.player)
            .addCollider(this.player)

        // Input
        this.inputManager = new InputManager(this)
        this.cursors = this.input.keyboard.createCursorKeys()
        this.scale.on('resize', this.resize, this)
    }

    resize(gameSize) {
        const { width, height } = gameSize

        this.cameras.main.setViewport(0, 0, width, height)
    } 

    update() {

        this.player.setVelocity(0)

        if (this.inputManager.isLeftPressed()) {
          this.player.setVelocityX(-GameConfig.PLAYER_SPEED)
        }

        if (this.inputManager.isRightPressed()) {
          this.player.setVelocityX(GameConfig.PLAYER_SPEED)
        }

        if (this.inputManager.isUpPressed()) {
          this.player.setVelocityY(-GameConfig.PLAYER_SPEED)
        }

        if (this.inputManager.isDownPressed()) {
          this.player.setVelocityY(GameConfig.PLAYER_SPEED)
        }
    }
}