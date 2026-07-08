// src/phaser/managers/PlayerManager.js
export default class PlayerManager {
    constructor(scene) {
        this.scene = scene
        this.player = null
        this.lastDirection = 'down'
    }

    create(x, y) {
        // Crée le sprite
        this.player = this.scene.physics.add.sprite(x, y, 'player_idle', 0)
        this.player.setDepth(5)
        this.player.setCollideWorldBounds(true)

        this.player.setOrigin(0.5, 1)
        this.player.body.setSize(20, 16)
        this.player.body.setOffset(10, 26)

        // Crée les animations
        this.createAnimations()

        // Animation par défaut
        this.player.play('idle_down')

        return this
    }

    createAnimations() {
        const anims = this.scene.anims

        // Idle
        const idleDirections = ['left', 'right', 'up', 'down']
        idleDirections.forEach((dir, i) => {
            anims.create({
                key: `idle_${dir}`,
                frames: anims.generateFrameNumbers('player_idle', {
                    start: i * 4,
                    end: i * 4 + 3
                }),
                frameRate: 6,
                repeat: -1
            })
        })

        // Walk
        const walkDirections = ['left', 'right', 'up', 'down']
        walkDirections.forEach((dir, i) => {
            anims.create({
                key: `walk_${dir}`,
                frames: anims.generateFrameNumbers('player_walk', {
                    start: i * 4,
                    end: i * 4 + 3
                }),
                frameRate: 8,
                repeat: -1
            })
        })
    }

    update(inputManager, speed) {
        const vx = inputManager.isLeftPressed()  ? -speed
                 : inputManager.isRightPressed() ?  speed
                 : 0
        const vy = inputManager.isUpPressed()    ? -speed
                 : inputManager.isDownPressed()  ?  speed
                 : 0

        this.player.setVelocity(vx, vy)
        this.updateAnimation(vx, vy)

        return { vx, vy } // utile pour le TriggerManager
    }

    updateAnimation(vx, vy) {
        if (vx < 0) {
            this.player.play('walk_left', true)
            this.lastDirection = 'left'
        } else if (vx > 0) {
            this.player.play('walk_right', true)
            this.lastDirection = 'right'
        } else if (vy < 0) {
            this.player.play('walk_up', true)
            this.lastDirection = 'up'
        } else if (vy > 0) {
            this.player.play('walk_down', true)
            this.lastDirection = 'down'
        } else {
            this.player.play(`idle_${this.lastDirection}`, true)
        }
    }

    // Repositionne le joueur (transition de map)
    setPosition(x, y) {
        this.player.setPosition(x, y)
        return this
    }

    // Bloque/débloque les mouvements (combat, dialogue)
    setActive(active) {
        this.player.setVelocity(0)
        this.player.active = active
        if (!active) this.player.play(`idle_${this.lastDirection}`, true)
        return this
    }

    getSprite() { return this.player }
    getX() { return this.player.x }
    getY() { return this.player.y }
    getDirection() { return this.lastDirection }

    preload(scene) {
        scene.load.spritesheet('player_idle', '/assets/img/characters/players/Character_Idle.png', {
            frameWidth: 40,
            frameHeight: 48
        })
        scene.load.spritesheet('player_walk', '/assets/img/characters/players/Character_Walk.png', {
            frameWidth: 40,
            frameHeight: 48
        })
    }
}