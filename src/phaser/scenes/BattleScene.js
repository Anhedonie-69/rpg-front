import Phaser from 'phaser'
import BattleManager from '../battle/BattleManager'

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')
    }

    init(data) {
        this.combatData   = data
        this.originScene  = data.originScene ?? 'WorldScene'
        this.zone         = data.zone ?? 'default'
        this.battleManager = null
        this.isPlayerTurn  = false
        this.currentActor  = null
        this.sprites       = {} // stocke les visuels
    }

    async create() {
        const { width, height } = this.scale

        // Fond
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e)

        // Message de chargement
        const loadText = this.add.text(width / 2, height / 2, 'Chargement...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        // Init BattleManager
        this.battleManager = new BattleManager(this)
        await this.battleManager.init(this.zone)

        // Retire le message
        loadText.destroy()

        // Affiche les combattants
        this.createEnemySprites()
        this.createPartySprites()

        // Affiche l'ordre CTB
        this.createCtbDisplay()

        // Lance le premier tour
        this.nextTurn()
    }

    createEnemySprites() {
        const { width, height } = this.scale
        const enemies   = this.battleManager.getEnemies()
        const startY    = height / 2 - ((enemies.length - 1) * 100) / 2

        enemies.forEach((enemy, i) => {
            const x = width * 0.25
            const y = startY + i * 100

            const rect = this.add.rectangle(x, y, enemy.size, enemy.size, enemy.color)
            
            const nameText = this.add.text(x, y - enemy.size / 2 - 20, enemy.name, {
                fontSize: '13px', fill: '#ffffff'
            }).setOrigin(0.5)

            const hpText = this.add.text(x, y + enemy.size / 2 + 5, `HP: ${enemy.hpCurrent}`, {
                fontSize: '11px', fill: '#ffaaaa'
            }).setOrigin(0.5)

            this.sprites[enemy.id] = { rect, nameText, hpText }
        })
    }

    createPartySprites() {
        const { width, height } = this.scale
        const party   = this.battleManager.getParty()
        const startY  = height / 2 - ((party.length - 1) * 80) / 2

        const classColors = {
            monk:      0x4a9eff,
            warrior:   0xff4a4a,
            red_mage:  0xff4aff,
            alchemist: 0x4aff9e,
        }

        party.forEach((member, i) => {
            const x     = width * 0.75
            const y     = startY + i * 80
            const color = classColors[member.class] ?? 0xffffff

            const rect = this.add.rectangle(x, y, 48, 48, color)

            const nameText = this.add.text(x + 35, y - 16, member.name, {
                fontSize: '13px', fill: '#ffffff'
            })

            const hpText = this.add.text(x + 35, y, `HP: ${member.hpCurrent}/${member.hpMax}`, {
                fontSize: '11px', fill: '#aaffaa'
            })

            const mpText = this.add.text(x + 35, y + 14, `MP: ${member.mpCurrent}/${member.mpMax}`, {
                fontSize: '11px', fill: '#aaaaff'
            })

            this.sprites[member.id] = { rect, nameText, hpText, mpText }
        })
    }

    createCtbDisplay() {
        const { width } = this.scale
        const order = this.battleManager.getCtbOrder(8)

        this.ctbContainer = this.add.container(width / 2, 30)

        const title = this.add.text(-200, 0, 'Ordre :', {
            fontSize: '12px', fill: '#888888'
        })
        this.ctbContainer.add(title)

        order.forEach((actor, i) => {
            const color = actor.type === 'character' ? '#4a9eff' : '#ff4a4a'
            const text  = this.add.text(-150 + i * 60, 0, actor.name.substring(0, 6), {
                fontSize: '11px',
                fill: color,
                backgroundColor: '#333333',
                padding: { x: 4, y: 2 }
            })
            this.ctbContainer.add(text)
        })
    }

    refreshCtbDisplay() {
        if (this.ctbContainer) this.ctbContainer.destroy()
        this.createCtbDisplay()
    }

    refreshSprite(actor) {
        const sprite = this.sprites[actor.id]
        if (!sprite) return

        if (actor.type === 'enemy') {
            sprite.hpText.setText(`HP: ${actor.hpCurrent}`)
            if (!actor.isAlive()) {
                sprite.rect.setAlpha(0.3)
                sprite.nameText.setAlpha(0.3)
                sprite.hpText.setText('KO')
            }
        } else {
            sprite.hpText.setText(`HP: ${actor.hpCurrent}/${actor.hpMax}`)
            sprite.mpText.setText(`MP: ${actor.mpCurrent}/${actor.mpMax}`)
            if (!actor.isAlive()) {
                sprite.rect.setAlpha(0.3)
                sprite.nameText.setAlpha(0.3)
                sprite.hpText.setText('KO')
            }
        }
    }

    // --- Flux de combat ---

    nextTurn() {
        // Vérifie fin de combat
        const result = this.battleManager.checkBattleEnd()
        if (result) {
            this.endBattle(result)
            return
        }

        // Prochain acteur
        this.currentActor = this.battleManager.getNextActor()
        if (!this.currentActor) return

        this.refreshCtbDisplay()

        // Highlight l'acteur actif
        this.highlightActor(this.currentActor)

        if (this.currentActor.type === 'character') {
            // Tour du joueur → affiche le menu
            this.showActionMenu()
        } else {
            // Tour ennemi → IA joue après un délai
            this.time.delayedCall(800, () => this.enemyTurn())
        }
    }

    highlightActor(actor) {
        // Retire tous les highlights
        Object.values(this.sprites).forEach(s => {
            s.rect?.setStrokeStyle(0)
        })
        // Highlight l'acteur actif
        const sprite = this.sprites[actor.id]
        if (sprite?.rect) {
            sprite.rect.setStrokeStyle(3, 0xffff00)
        }
    }

    showActionMenu() {
        const { width, height } = this.scale

        // Détruit le menu précédent
        if (this.actionMenu) this.actionMenu.destroy()

        this.actionMenu = this.add.container(width / 2, height - 60)

        const bg = this.add.rectangle(0, 0, 300, 50, 0x000033, 0.9)
        const attackBtn = this.add.text(-80, 0, '⚔️ Attaquer', {
            fontSize: '16px', fill: '#ffffff',
            backgroundColor: '#1a1a4e',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        const fleeBtn = this.add.text(80, 0, '🏃 Fuir', {
            fontSize: '16px', fill: '#ffaaaa',
            backgroundColor: '#1a1a4e',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        // Actions
        attackBtn.on('pointerdown', () => this.playerAttack())
        fleeBtn.on('pointerdown', () => this.endBattle('flee'))

        // Hover
        attackBtn.on('pointerover', () => attackBtn.setStyle({ fill: '#ffff00' }))
        attackBtn.on('pointerout',  () => attackBtn.setStyle({ fill: '#ffffff' }))
        fleeBtn.on('pointerover',   () => fleeBtn.setStyle({ fill: '#ff0000' }))
        fleeBtn.on('pointerout',    () => fleeBtn.setStyle({ fill: '#ffaaaa' }))

        this.actionMenu.add([bg, attackBtn, fleeBtn])

        // Affiche qui joue
        const actorText = this.add.text(width / 2, height - 100,
            `Tour de : ${this.currentActor.name}`, {
            fontSize: '14px', fill: '#ffff00'
        }).setOrigin(0.5)
        this.actionMenu.add(actorText)
    }

    async playerAttack() {
        // Cache le menu
        if (this.actionMenu) {
            this.actionMenu.destroy()
            this.actionMenu = null
        }

        // Cible le premier ennemi vivant
        const target = this.battleManager.getEnemies().find(e => e.isAlive())
        if (!target) {
            this.nextTurn()
            return
        }

        // Calcule et applique les dégâts
        const result = await this.battleManager.performAttack(this.currentActor, target)

        if (result) {
            // Affiche les dégâts
            this.showDamageText(this.sprites[target.id]?.rect, result.damage, result.isCrit)
            // Rafraîchit le sprite
            this.refreshSprite(target)
        }

        // Petit délai puis prochain tour
        this.time.delayedCall(800, () => this.nextTurn())
    }

    async enemyTurn() {
        const action = this.battleManager.getEnemyAction(this.currentActor)
        if (!action) {
            this.nextTurn()
            return
        }

        const result = await this.battleManager.performAttack(this.currentActor, action.target)

        if (result) {
            this.showDamageText(this.sprites[action.target.id]?.rect, result.damage, result.isCrit)
            this.refreshSprite(action.target)
        }

        this.time.delayedCall(800, () => this.nextTurn())
    }

    showDamageText(sprite, amount, isCrit = false) {
        if (!sprite) return

        const color = isCrit ? '#ffff00' : '#ffffff'
        const size  = isCrit ? '22px' : '18px'
        const text  = isCrit ? `${amount}!` : `${amount}`

        const dmgText = this.add.text(sprite.x, sprite.y - 20, text, {
            fontSize: size,
            fill: color,
            fontStyle: isCrit ? 'bold' : 'normal'
        }).setOrigin(0.5)

        // Animation montée + disparition
        this.tweens.add({
            targets:  dmgText,
            y:        sprite.y - 60,
            alpha:    0,
            duration: 800,
            onComplete: () => dmgText.destroy()
        })
    }

    endBattle(result) {
        console.log('Fin du combat :', result)

        if (this.actionMenu) this.actionMenu.destroy()

        // Affiche le résultat
        const { width, height } = this.scale
        const color  = result === 'victory' ? '#ffff00' : '#ff4444'
        const label  = result === 'victory' ? 'Victoire !' 
                     : result === 'defeat'  ? 'Défaite...' 
                     : 'Fuite !'

        this.add.text(width / 2, height / 2, label, {
            fontSize: '40px',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Retour après 2 secondes
        this.time.delayedCall(2000, () => {
            this.children.removeAll(true)
            this.scene.resume(this.originScene)
            this.scene.stop('BattleScene')
        })
    }
}

/*import Phaser from 'phaser'
import { store } from '../../app/store';
import { authFetch } from '../../services/auth.service';
import BattleManager from '../battle/BattleManager';
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
}*/