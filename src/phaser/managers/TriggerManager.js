import Phaser from 'phaser'

export default class TriggerManager {
    constructor(scene, player) {
        this.scene = scene
        this.player = player
        this.originScene = scene.scene.key  // ← nom de la scène courante

        this.stepCount = 0
        this.stepThreshold = this.randomStepThreshold()
        this.lastPlayerTile = null
        this.isInCombatZone = false
        this.callbacks = {}
    }

    // Enregistre les callbacks pour chaque type de trigger
    on(eventType, callback) {
        this.callbacks[eventType] = callback
        return this
    }

    // Appelle le bon callback
    emit(eventType, data = {}) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType](data)
        }
    }

    // Nombre de pas aléatoire avant combat Selon la zone 
    randomStepThreshold(zone = 'default') {
        const ranges = {
            'default':    [10, 30],
            'foret':      [5, 15],   // forêt dangereuse
            'donjon':     [3, 10],   // donjon très dangereux
            'plaine':     [20, 40],  // plaine tranquille
        }
        const [min, max] = ranges[zone] ?? ranges['default']
        return Phaser.Math.Between(min, max)
    }

    // Vérifie le layer Triggers à la position du joueur
    update(triggerLayer) {
        if (!triggerLayer) return

        const playerTileX = triggerLayer.worldToTileX(this.player.x)
        const playerTileY = triggerLayer.worldToTileY(this.player.y)

        // Vérifie si le joueur a bougé d'une tuile
        const currentTile = `${playerTileX},${playerTileY}`
        if (currentTile === this.lastPlayerTile) return
        this.lastPlayerTile = currentTile

        // Récupère la tuile sous le joueur
        const tile = triggerLayer.getTileAt(playerTileX, playerTileY)

        if (!tile || tile.index === -1) {
            this.isInCombatZone = false
            return
        }

        // Lis les propriétés de la tuile dans Tiled
        const type = tile.properties?.triggerType

        switch (type) {
            case 'combat_zone':
                this.isInCombatZone = true
                this.handleStep()
                break

            case 'map_transition':
                this.isInCombatZone = false
                this.emit('map_transition', {
                    targetMap:  tile.properties.targetMap,
                    spawnPoint: tile.properties.spawnPoint,
                })
                break

            case 'dialogue':
                this.isInCombatZone = false
                this.emit('dialogue', {
                    dialogueId: tile.properties.dialogueId,
                })
                break

            case 'event':
                this.isInCombatZone = false
                this.emit('event', {
                    eventId: tile.properties.eventId,
                })
                break

            default:
                this.isInCombatZone = false
                break
        }
    }

    handleStep() {
        this.stepCount++
        if (this.stepCount >= this.stepThreshold) {
            this.stepCount = 0
            this.stepThreshold = this.randomStepThreshold()
            this.emit('combat', {
                zone: 'default', // pour choisir les ennemis selon la zone
                originScene: this.originScene  // ← passe le nom de la scène
            })
        }
    }

    resetSteps() {
        this.stepCount = 0
        this.stepThreshold = this.randomStepThreshold()
    }
}