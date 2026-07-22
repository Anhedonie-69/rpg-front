import GameConfig from '../config/GameConfig'
import MapConfig from '../config/MapConfig'

export default class MapManager {
    constructor(scene) {
        this.scene = scene
        this.map = null
        this.tileset = null
        this.layers = {}
        this.objects = {}
        this.currentMapId = null
    }

    // Précharge les assets d'une map
    static preload(scene, mapId) {
        const mapData = MapConfig.maps[mapId]
        if (!mapData) {
            console.error(`Map inconnue : ${mapId}`)
            return
        }
        scene.load.image(`tileset_${mapId}`, mapData.tileset)
        scene.load.tilemapTiledJSON(mapId, mapData.json)
    }

    loadMap(mapId) {
        const mapData = MapConfig.maps[mapId]
        if (!mapData) {
            console.error(`Map inconnue : ${mapId}`)
            return this
        }

        this.currentMapId = mapId
        this.map = this.scene.make.tilemap({ key: mapId })
        this.tileset = this.map.addTilesetImage('Map', `tileset_${mapId}`)
        
        // Crée les layers dans l'ordre (important pour le rendu)
        this.layers.ground  = this.map.createLayer('Ground', this.tileset, 0, 0)
        this.layers.objects = this.map.createLayer('Objects', this.tileset, 0, 0)
        this.layers.triggers = this.map.createLayer('Triggers', this.tileset, 0, 0)
        this.layers.above   = this.map.createLayer('Above', this.tileset, 0, 0)

        this.objects.npcs = this.map.getObjectLayer('NPCs')?.objects ?? []

        // Collisions sur Objects
        this.layers.objects.setCollisionByExclusion([-1])

        // Above s'affiche par dessus le joueur
        if (this.layers.above) {
            this.layers.above.setDepth(10)
        }

        // Rend visible ou non les triggers
        if (this.layers.triggers) this.layers.triggers.setVisible(true)

        // Bounds physiques et caméra
        this.scene.physics.world.setBounds(
            0, 0,
            this.map.widthInPixels,
            this.map.heightInPixels
        )

        return this
    }

    setupCamera(player) {
        const camera = this.scene.cameras.main
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        camera.startFollow(player, true, 0.1, 0.1) // lerp pour caméra fluide
        camera.setZoom(GameConfig.CAMERA_ZOOM)
        return this
    }

    addCollider(player) {
        this.scene.physics.add.collider(player, this.layers.objects)
        return this
    }

    // Charge une nouvelle map dynamiquement
    changeMap(mapKey, tilesetKey, player, spawnX, spawnY) {
        // Détruit les layers actuels
        Object.values(this.layers).forEach(layer => {
            if (layer) layer.destroy()
        })
        this.layers = {}

        // Charge la nouvelle map
        this.loadMap(mapKey, tilesetKey)
        this.setupCamera(player)
        this.addCollider(player)

        // Repositionne le joueur
        player.setPosition(spawnX, spawnY)

        return this
    }

    getSpawnPoint(name = 'spawn') {
        // Récupère un point de spawn défini dans Tiled (Object Layer)
        const point = this.map.findObject('Spawns', obj => obj.name === name)
        return point
            ? { x: point.x, y: point.y }
            : { x: 100, y: 100 } // fallback
    }

    getWidth()  { return this.map?.widthInPixels ?? 0 }
    getHeight() { return this.map?.heightInPixels ?? 0 }
    getObjectsLayer() { return this.layers.objects }
    getNPCs() { return this.objects.npcs }
}