import Phaser from 'phaser'
import { authFetch } from '../../services/auth.service'
import { store } from '../../app/store'
import i18next from 'i18next'

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    init(data) {
        this.originScene = data.originScene ?? 'TestScene'
        this.activeTab   = 'items'  // 'items' ou 'save'
    }

    create() {
        const { width, height } = this.scale

        // Fond semi-transparent
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)

        // Fenêtre du menu
        this.menuBg = this.add.rectangle(width / 2, height / 2, 500, 380, 0x0a0a2e)
            .setStrokeStyle(2, 0x4444aa)

        // Titre
        this.add.text(width / 2, height / 2 - 170, i18next.t('game.menu.title'), {
            fontSize: '20px', fill: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5)

        // Or — affiché en permanence
        const gold = store.getState().game.gold ?? 0
        this.add.text(width / 2 + 180, height / 2 - 170, `💰 ${gold} ${i18next.t('game.menu.gold')}`, {
            fontSize: '14px', fill: '#ffcc00'
        }).setOrigin(1, 0.5)

        // Onglets
        this.createTabs()

        // Contenu
        this.contentContainer = this.add.container(0, 0)
        this.showTab(this.activeTab)

        // Touche Échap / P pour fermer
        this.input.keyboard.on('keydown-ESC', () => this.closeMenu())
        this.input.keyboard.on('keydown-P',   () => this.closeMenu())
    }

    createTabs() {
        const { width, height } = this.scale
        const tabY = height / 2 - 135

        const tabs = [
            { key: 'items', label: `🎒 ${i18next.t('game.menu.tabs.items')}`,      x: width / 2 - 80 },
            { key: 'save',  label: `💾 ${i18next.t('game.menu.tabs.save')}`,  x: width / 2 + 80 },
        ]

        this.tabButtons = {}

        tabs.forEach(tab => {
            const btn = this.add.text(tab.x, tabY, tab.label, {
                fontSize: '15px',
                fill: this.activeTab === tab.key ? '#ffff00' : '#aaaaaa',
                backgroundColor: this.activeTab === tab.key ? '#1a1a4e' : '#0a0a2e',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true })

            btn.on('pointerdown', () => {
                this.activeTab = tab.key
                this.refreshTabs()
                this.contentContainer.removeAll(true)
                this.showTab(tab.key)
            })

            btn.on('pointerover', () => {
                if (this.activeTab !== tab.key) btn.setStyle({ fill: '#ffffff' })
            })
            btn.on('pointerout', () => {
                if (this.activeTab !== tab.key) btn.setStyle({ fill: '#aaaaaa' })
            })

            this.tabButtons[tab.key] = btn
        })
    }

    refreshTabs() {
        Object.entries(this.tabButtons).forEach(([key, btn]) => {
            const active = key === this.activeTab
            btn.setStyle({
                fill: active ? '#ffff00' : '#aaaaaa',
                backgroundColor: active ? '#1a1a4e' : '#0a0a2e',
            })
        })
    }

    showTab(tab) {
        if (tab === 'items') this.showItems()
        if (tab === 'save')  this.showSave()
    }

    // ── ONGLET OBJETS ──────────────────────────────────────────
    showItems() {
        const { width, height } = this.scale
        const startY = height / 2 - 90

        // Récupère l'inventaire depuis Redux
        const inventory = store.getState().game.inventory ?? []

        if (inventory.length === 0) {
            const txt = this.add.text(width / 2, height / 2, i18next.t('game.menu.inventory.empty'), {
                fontSize: '14px', fill: '#888888'
            }).setOrigin(0.5)
            this.contentContainer.add(txt)
            return
        }

        inventory.forEach((item, i) => {
            const y = startY + i * 40
            const row = this.add.text(width / 2 - 180, y,
                `${item.name}  x${item.quantity}  —  ${item.description}`, {
                fontSize: '14px', fill: '#ffffff'
            })
            this.contentContainer.add(row)
        })
    }

    // ── ONGLET SAUVEGARDE ──────────────────────────────────────
    async showSave() {
        const { width, height } = this.scale
        const startY = height / 2 - 90

        // Chargement
        const loadTxt = this.add.text(width / 2, height / 2, 'Chargement...', {
            fontSize: '14px', fill: '#888888'
        }).setOrigin(0.5)
        this.contentContainer.add(loadTxt)

        // Récupère les saves depuis l'API
        let saves = []
        try {
            const res  = await authFetch('/api/saves')
            saves = await res.json()
        } catch (err) {
            console.error('Erreur chargement saves:', err)
        }

        loadTxt.destroy()

        // Affiche les 3 slots
        saves.forEach((save, i) => {
            const y = startY + i * 80

            // Fond du slot
            const slotBg = this.add.rectangle(
                width / 2, y + 20, 420, 65,
                save.empty ? 0x111111 : 0x1a1a3e
            ).setStrokeStyle(1, save.empty ? 0x333333 : 0x4444aa)
            this.contentContainer.add(slotBg)

            // Infos du slot
            if (save.empty) {
                const emptyTxt = this.add.text(width / 2, y + 20, `Slot ${save.slot} — Vide`, {
                    fontSize: '14px', fill: '#555555'
                }).setOrigin(0.5)
                this.contentContainer.add(emptyTxt)
            } else {
                const infoTxt = this.add.text(width / 2 - 190, y, 
                    `${i18next.t('game.menu.save.slot')} ${save.slot} — ${save.mapId}`, {
                    fontSize: '13px', fill: '#ffcc00', fontStyle: 'bold'
                })
                const timeTxt = this.add.text(width / 2 - 190, y + 18,
                    `${i18next.t('game.menu.save.time')} : ${this.formatTime(save.playTime)}  |  ${i18next.t('game.menu.save.gold')} : ${save.gold}`, {
                    fontSize: '12px', fill: '#aaaaaa'
                })
                const dateTxt = this.add.text(width / 2 - 190, y + 34,
                    `${i18next.t('game.menu.save.savedAt')} : ${new Date(save.updatedAt).toLocaleString()}`, {
                    fontSize: '11px', fill: '#777777'
                })
                this.contentContainer.add([infoTxt, timeTxt, dateTxt])
            }

            // Bouton Sauvegarder
            const saveBtn = this.add.text(width / 2 + 150, y + 20, `💾 ${i18next.t('game.menu.save.saveBtn')}`, {
                fontSize: '12px', fill: '#aaffaa',
                backgroundColor: '#0a2e0a',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true })

            saveBtn.on('pointerdown', () => this.saveToSlot(save.slot))
            saveBtn.on('pointerover', () => saveBtn.setStyle({ fill: '#ffffff' }))
            saveBtn.on('pointerout',  () => saveBtn.setStyle({ fill: '#aaffaa' }))

            this.contentContainer.add(saveBtn)
        })
    }

    async saveToSlot(slot) {
        const gameState = store.getState().game

        try {
            const res = await authFetch(`/api/saves/${slot}`, {
                method: 'POST',
                body: JSON.stringify({
                    mapId:    gameState.mapId    ?? 'zone_test',
                    posX:     gameState.posX     ?? 0,
                    posY:     gameState.posY     ?? 0,
                    playTime: gameState.playTime ?? 0,
                    gold:     gameState.gold     ?? 0,
                    chapter:  gameState.chapter  ?? 0,
                    flags:    gameState.flags    ?? {},
                    partyIds: gameState.partyIds ?? [],
                    inventory: gameState.inventory ?? [],
                })
            })

            if (res.ok) {
                // Feedback visuel
                this.showSaveConfirmation(slot)
                // Rafraîchit l'onglet
                this.contentContainer.removeAll(true)
                this.showSave()
            }
        } catch (err) {
            console.error('Erreur sauvegarde:', err)
        }
    }

    showSaveConfirmation(slot) {
        const { width, height } = this.scale
        const txt = this.add.text(width / 2, height / 2 - 160,
            `✅ ${i18n.t('game.menu.save.slot')} ${slot} ${i18n.t('game.menu.save.confirmed')}`, {
            fontSize: '14px', fill: '#aaffaa',
            backgroundColor: '#0a2e0a',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(30)
    
        // Disparaît après 2 secondes
        this.time.delayedCall(2000, () => txt.destroy())
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    closeMenu() {
        const originScene = this.scene.get(this.originScene)
        if (originScene?.playerManager) {
            originScene.playerManager.setActive(true)
        }
        this.children.removeAll(true)
        this.scene.stop('MenuScene')
    }
}