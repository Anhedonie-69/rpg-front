import Phaser from 'phaser'
import { store } from '../../app/store';
import { authFetch } from '../../services/auth.service';
import InputManager from '../managers/InputManager';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
    }

    init(data) {
        this.combatData  = data
        this.originScene = data.originScene ?? 'WorldScene'
        this.party       = []
        this.enemies     = []
    }

    async create() {
        const { width, height } = this.scale

        // Fond
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e)

        // Charge l'équipe depuis l'API
        await this.loadParty()

        // Crée les ennemis de test
        this.createEnemies()

        // Affiche l'équipe
        this.createParty()

        // Touches temporaires
        this.input.keyboard.once('keydown-ESC', () => this.endBattle('flee'))
        this.input.keyboard.once('keydown-ENTER', () => this.endBattle('victory'))

        // Debug
        this.add.text(10, 10, 'BattleScene — Échap: fuir | Entrée: victoire', {
            fontSize: '12px',
            fill: '#888888'
        }).setScrollFactor(0)
    }

    async loadParty() {
        try {
            const res  = await authFetch('/api/characters')
            const data = await res.json()

            // Uniquement les personnages débloqués
            this.party = data.filter(c => c.unlocked)
        } catch (err) {
            console.error('Erreur chargement équipe:', err)
            this.party = []
        }
    }

    createParty() {
        const { width, height } = this.scale

        // Couleurs par classe
        const classColors = {
            monk:      0x4a9eff,
            warrior:   0xff4a4a,
            red_mage:  0xff4aff,
            alchemist: 0x4aff9e,
        }

        const memberCount = this.party.length
        const startY      = height / 2 - ((memberCount - 1) * 80) / 2

        this.party.forEach((member, i) => {
            const x     = width * 0.75
            const y     = startY + i * 80
            const color = classColors[member.class] ?? 0xffffff

            // Carré du personnage
            const rect = this.add.rectangle(x, y, 48, 48, color)

            // Nom + HP
            this.add.text(x + 35, y - 10, member.name, {
                fontSize: '13px',
                fill: '#ffffff'
            })
            this.add.text(x + 35, y + 6, `HP: ${member.hpCurrent}/${member.hpMax}`, {
                fontSize: '11px',
                fill: '#aaffaa'
            })
            this.add.text(x + 35, y + 20, `MP: ${member.mpCurrent}/${member.mpMax}`, {
                fontSize: '11px',
                fill: '#aaaaff'
            })
        })
    }

    createEnemies() {
        const { width, height } = this.scale

        // Ennemi de test
        const enemies = [
            { name: 'Slime',   hp: 80,  color: 0x00ff00, size: 48 },
            { name: 'Gobelin', hp: 120, color: 0xff6600, size: 56 },
        ]

        const startY = height / 2 - ((enemies.length - 1) * 100) / 2

        enemies.forEach((enemy, i) => {
            const x = width * 0.25
            const y = startY + i * 100

            // Carré ennemi
            this.add.rectangle(x, y, enemy.size, enemy.size, enemy.color)

            // Nom + HP
            this.add.text(x, y - enemy.size / 2 - 20, enemy.name, {
                fontSize: '13px',
                fill: '#ffffff'
            }).setOrigin(0.5)

            this.add.text(x, y + enemy.size / 2 + 5, `HP: ${enemy.hp}`, {
                fontSize: '11px',
                fill: '#ffaaaa'
            }).setOrigin(0.5)

            this.enemies.push(enemy)
        })
    }

    endBattle(result) {
        console.log('Fin du combat :', result)
        this.children.removeAll(true)
        this.scene.resume(this.originScene)
        this.scene.stop('BattleScene')
    }
}