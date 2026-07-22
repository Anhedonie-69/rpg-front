import Phaser from 'phaser'

export default class NPCManager {
    constructor(scene, mapManager, player) {
        this.scene      = scene
        this.mapManager = mapManager
        this.player     = player
        this.npcs       = []
        this.nearbyNPC   = null
    }

    create() {
        const npcData = this.mapManager.getNPCs()

        npcData.forEach(obj => {
            // Récupère les propriétés Tiled
            const props      = {}
            obj.properties?.forEach(p => props[p.name] = p.value)

            const npc = {
                id:         obj.id,
                name:       props.name       ?? 'NPC',
                dialogueId: props.dialogueId   ?? null,
                range:      props.range      ?? 80,
                x:          obj.x + obj.width  / 2,
                y:          obj.y + obj.height / 2,
                sprite:     null,
                label:      null,
                indicator:  null,
            }

            // Visuel temporaire — carré jaune
            npc.sprite = this.scene.add.rectangle(npc.x, npc.y, 32, 32, 0xffcc00).setDepth(5)

            npc.sprite = this.scene.physics.add.staticImage(npc.x, npc.y, '__DEFAULT')
                .setDisplaySize(32, 32)
                .setDepth(5)
                .setTint(0xffcc00)
                .refreshBody()

            // Nom au dessus
            npc.label = this.scene.add.text(
                npc.x, npc.y - 28,
                npc.name.replace('npc_', '').replace(/_/g, ' '),
                { fontSize: '11px', fill: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 } }
            ).setOrigin(0.5).setDepth(6)

            // Indicateur [E] caché par défaut
            npc.indicator = this.scene.add.text(
                npc.x, npc.y - 48,
                '[E] Parler',
                { fontSize: '12px', fill: '#ffff00', backgroundColor: '#00000099', padding: { x: 4, y: 2 } }
            ).setOrigin(0.5).setDepth(6).setVisible(false)

            this.npcs.push(npc)
        })

        return this
    }

    // Appelé dans update() de la scène
    update(inputManager) {
        this.nearbyNPC = null

        this.npcs.forEach(npc => {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npc.x, npc.y
            )

            if (dist <= npc.range) {
                // PNJ à portée
                this.nearbyNPC = npc
                npc.indicator.setVisible(true)

                // Joueur appuie sur E
                if (inputManager.isInteractJustPressed()) {
                    this.interact(npc)
                }
            } else {
                npc.indicator.setVisible(false)
            }
        })
    }

    interact(npc) {
        if (!npc.dialogueId) return
        console.log('Interaction avec', npc.name, '→', npc.dialogueId)

        // Émet l'événement dialogue vers la scène
        this.scene.events.emit('npc:interact', {
            npcName:    npc.name,
            dialogueId: npc.dialogueId,
        })
    }

    getNearbyNPC() { return this.nearbyNPC }
}