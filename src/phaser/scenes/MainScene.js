import Phaser from 'phaser'
import GameConfig from '../config/GameConfig';
import InputManager from '../managers/InputManager';

export default class MainScene extends Phaser.Scene {

    constructor() {
        super('MainScene')
    }

    preload() {
        this.load.image('player', '/assets/pouce_benni2.png')
    }

    create() {
        this.scale.on('resize', this.resize, this)

        const centerX = this.scale.width / 2
        const centerY = this.scale.height / 2

        this.player = this.physics.add.sprite(centerX, centerY, 'player')

        this.inputManager = new InputManager(this)

        this.player.setCollideWorldBounds(true)

        this.cursors = this.input.keyboard.createCursorKeys()
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