// src/phaser/config/MapConfig.js
export default {
    maps: {
        zone_test: {
            id:      'zone_test',
            name:    'Zone de test',
            tileset: '/assets/img/tiles/tiles.png',
            json:    '/assets/img/maps/map_test.json',
            music:   'theme_test',   // pour plus tard
        },
        // Prologue

        // Rock

        // Pop

        // Disco

        // Rap
    },

    // Map de départ pour une nouvelle partie
    defaultMap: 'zone_test',
    defaultX: 200,
    defaultY: 200,
}