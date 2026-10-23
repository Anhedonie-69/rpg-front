import Phaser from 'phaser'
import { store } from '../../app/store'
import BattleManager from '../battle/BattleManager'
import i18next from 'i18next'
import { addGold, addItem, removeItem } from '../../features/game/gameSlice'

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
        const loadText = this.add.text(width / 2, height / 2, i18next.t('game.loading'), {
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

        const title = this.add.text(-200, 0, i18next.t('game.battle.order'), {
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

        // Crée le container EN PREMIER
        this.actionMenu = this.add.container(width / 2, height - 60)

        const bg = this.add.rectangle(0, 0, 400, 50, 0x000033, 0.9)

        const attackBtn = this.add.text(-120, 0, `⚔️ ${i18next.t('game.battle.attack')}`, {
            fontSize: '16px', fill: '#ffffff',
            backgroundColor: '#1a1a4e',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        const fleeBtn = this.add.text(120, 0, `🏃 ${i18next.t('game.battle.flee')}`, {
            fontSize: '16px', fill: '#ffaaaa',
            backgroundColor: '#1a1a4e',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })

        attackBtn.on('pointerdown', () => this.playerAttack())
        attackBtn.on('pointerover', () => attackBtn.setStyle({ fill: '#ffff00' }))
        attackBtn.on('pointerout',  () => attackBtn.setStyle({ fill: '#ffffff' }))

        fleeBtn.on('pointerdown', () => this.endBattle('flee'))
        fleeBtn.on('pointerover', () => fleeBtn.setStyle({ fill: '#ff0000' }))
        fleeBtn.on('pointerout',  () => fleeBtn.setStyle({ fill: '#ffaaaa' }))

        this.actionMenu.add([bg, attackBtn, fleeBtn])

        // Potion APRÈS la création du container
        const inventory = store.getState().game.inventory ?? []
        const potions   = inventory.find(i => i.id === 'potion')

        if (potions) {
            const itemBtn = this.add.text(0, 0, `🧪 ${i18next.t('game.battle.potion')} (${potions.quantity})`, {
                fontSize: '16px', fill: '#ffcc00',
                backgroundColor: '#1a1a4e',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true })

            itemBtn.on('pointerdown', () => this.usePotion())
            itemBtn.on('pointerover', () => itemBtn.setStyle({ fill: '#ffffff' }))
            itemBtn.on('pointerout',  () => itemBtn.setStyle({ fill: '#ffcc00' }))

            this.actionMenu.add(itemBtn)
        }

        // Affiche qui joue
        const actorText = this.add.text(width / 2, height - 100,
            `${i18next.t('game.battle.turn')} ${this.currentActor.name}`, {
            fontSize: '14px', fill: '#ffff00'
        }).setOrigin(0.5)
        this.actionMenu.add(actorText)
    }

    usePotion() {
        if (this.actionMenu) {
            this.actionMenu.destroy()
            this.actionMenu = null
        }

        // Soigne le personnage avec le moins de HP
        const target = this.battleManager.getParty()
            .filter(m => m.isAlive())
            .sort((a, b) => (a.hpCurrent / a.hpMax) - (b.hpCurrent / b.hpMax))[0]

        if (!target) { this.nextTurn(); return }

        const healed = Math.min(50, target.hpMax - target.hpCurrent)
        target.heal(50)

        // Retire la potion de l'inventaire Redux
        store.dispatch(removeItem({ id: 'potion' }))

        // Affiche le soin
        this.showHealText(this.sprites[target.id]?.rect, healed)
        this.refreshSprite(target)

        this.time.delayedCall(800, () => this.nextTurn())
    }

    showHealText(sprite, amount) {
        if (!sprite) return
        const txt = this.add.text(sprite.x, sprite.y - 20, `+${amount} HP`, {
            fontSize: '18px', fill: '#00ff88', fontStyle: 'bold'
        }).setOrigin(0.5)

        this.tweens.add({
            targets: txt, y: sprite.y - 60, alpha: 0,
            duration: 800, onComplete: () => txt.destroy()
        })
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

    async endBattle(result) {
        // console.log('Fin du combat :', result)

        if (this.actionMenu) this.actionMenu.destroy()

        // Affiche le résultat
        const { width, height } = this.scale
        
        if (result === 'victory') {
            // Calcule le loot
            const loot = await this.battleManager.performLoot(
                this.battleManager.getEnemies()
            )

            // Dispatch vers Redux
            store.dispatch(addGold(loot.gold))
            loot.items.forEach(item => store.dispatch(addItem(item)))

            // Affiche le résultat
            this.add.text(width / 2, height / 2 - 60, `✨ ${i18next.t('game.battle.victory')}`, {
                fontSize: '40px', fill: '#ffff00', fontStyle: 'bold'
            }).setOrigin(0.5)

            this.add.text(width / 2, height / 2, `+${loot.xp} XP  |  +${loot.gold} ${i18next.t('game.menu.gold')}`, {
                fontSize: '18px', fill: '#aaffaa'
            }).setOrigin(0.5)

            if (loot.items.length > 0) {
                const itemNames = loot.items.map(i => `${i.name} x${i.quantity}`).join(', ')
                this.add.text(width / 2, height / 2 + 40, `${i18next.t('game.battle.items')} ${itemNames}`, {
                    fontSize: '15px', fill: '#ffcc00'
                }).setOrigin(0.5)
            } else {
                this.add.text(width / 2, height / 2 + 40, i18next.t('game.battle.noItems'), {
                    fontSize: '14px', fill: '#777777'
                }).setOrigin(0.5)
            }

        } else {
            const color = result === 'defeat' ? '#ff4444' : '#aaaaaa'
            const label = result === 'defeat' ? i18next.t('game.battle.defeat') : i18next.t('game.battle.fleeResult')
            this.add.text(width / 2, height / 2, label, {
                fontSize: '40px', fill: color, fontStyle: 'bold'
            }).setOrigin(0.5)
        }

        // Retour après 2 secondes
        this.time.delayedCall(2000, () => {
            this.children.removeAll(true)
            this.scene.resume(this.originScene)
            this.scene.stop('BattleScene')
        })
    }
}