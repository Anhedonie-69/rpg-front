import Phaser from 'phaser'
import { store } from '../../app/store'

export default class InputManager {
    constructor(scene) {
        this.scene = scene 

        const layout = store.getState().user?.options?.keyboardLayout || 'azerty'

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

        const activeLayout = layouts[layout]

        this.keys = scene.input.keyboard.addKeys({
            up: activeLayout.up,
            down: activeLayout.down,
            left: activeLayout.left,
            right: activeLayout.right,

            interact: Phaser.Input.Keyboard.KeyCodes.E,
            inventory: Phaser.Input.Keyboard.KeyCodes.I,
            map: Phaser.Input.Keyboard.KeyCodes.M,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
            escape:    Phaser.Input.Keyboard.KeyCodes.ESC,
            enter:     Phaser.Input.Keyboard.KeyCodes.ENTER,
            pause:     Phaser.Input.Keyboard.KeyCodes.P,
        })
    }

    isUpPressed() { return this.keys.up.isDown }
    isDownPressed() { return this.keys.down.isDown }
    isLeftPressed() { return this.keys.left.isDown }
    isRightPressed() { return this.keys.right.isDown }

    
    isInteractJustPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.interact) }
    isInventoryJustPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.inventory)}
    isMapJustPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.map)}
    isAttackJustPressed() { return Phaser.Input.Keyboard.JustDown(this.keys.attack)}

    isEscapePressed()  { return Phaser.Input.Keyboard.JustDown(this.keys.escape) }
    isEnterPressed()   { return Phaser.Input.Keyboard.JustDown(this.keys.enter) }
    isPausePressed()   { return Phaser.Input.Keyboard.JustDown(this.keys.pause) }

    resetFlags() {
        this._interactJustDown = false
    }
}