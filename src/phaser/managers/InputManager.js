import Phaser from 'phaser'
import InputConfig from '../config/InputConfig'

export default class InputManager {
    constructor(scene) {
        this.scene = scene  

        const layouts = {
            azerty: {
                up: Phaser.Input.Keyboard.KeyCodes.Z,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.Q,
                right: Phaser.Input.Keyboard.KeyCodes.D
            },

            qwerty: {
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }
        }

        const activeLayout = layouts[InputConfig.layout]

        this.keys = scene.input.keyboard.addKeys({
            up: activeLayout.up,
            down: activeLayout.down,
            left: activeLayout.left,
            right: activeLayout.right,

            interact: Phaser.Input.Keyboard.KeyCodes.E,
            inventory: Phaser.Input.Keyboard.KeyCodes.I,
            map: Phaser.Input.Keyboard.KeyCodes.M,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE
        })
    }

    isUpPressed() { return this.keys.up.isDown }
    isDownPressed() { return this.keys.down.isDown }
    isLeftPressed() { return this.keys.left.isDown }
    isRightPressed() { return this.keys.right.isDown }

    isInteractPressed() { return this.keys.interact.isDown }
    isInventoryPressed() { return this.keys.inventory.isDown }
    isMapPressed() { return this.keys.map.isDown }
    isAttackPressed() { return this.keys.attack.isDown }
}