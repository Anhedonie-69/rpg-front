import Phaser from 'phaser'
import InputManager from '../managers/InputManager';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
    }

    init(data) {
        // Reçoit les données du trigger
        this.combatData = data
        this.originScene = data.originScene ?? 'TestScene'
    }

    preload() {
        
    }

    create() {
        const { width, height } = this.scale

        // Fond semi-transparent
        const overlay = this.add.rectangle(
            width / 2, height / 2,
            width, height,
            0x000000, 0.85
        ).setScrollFactor(0)

        // Texte temporaire
        this.add.text(width / 2, height / 2 - 40, '⚔️ Combat !', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0)

        this.add.text(width / 2, height / 2 + 20, 'Appuie sur [Échap] pour fuir', {
            fontSize: '16px',
            fill: '#aaaaaa'
        }).setOrigin(0.5).setScrollFactor(0)

        // Touche Échap pour sortir (temporaire)
        this.input.keyboard.once('keydown-ESC', () => {
            this.endBattle('flee')
        })

        // Touche Entrée pour victoire (temporaire)
        this.input.keyboard.once('keydown-ENTER', () => {
            this.endBattle('victory')
        })
    }

    endBattle(result) {
        // Détruit tous les éléments de la scène avant de la stopper
        this.children.removeAll(true)
        
        // Reprend la scène d'origine
        this.scene.resume(this.originScene)
        this.scene.stop('CombatScene')
    }

    update() {
        
    }
}