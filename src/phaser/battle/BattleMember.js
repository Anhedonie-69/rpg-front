export default class BattleMember {
    
    constructor(data, type = 'character') {
        this.type      = type  // 'character' ou 'enemy'
        this.id        = data.id ?? data.class
        this.enemyId   = data.enemyId ?? data.id  // ← id pour l'API
        this.name      = data.name
        this.class     = data.class ?? null
        this.slot      = data.slot ?? 0

        this.hpMax     = data.hpMax ?? data.hp
        this.mpMax     = data.mpMax ?? data.mp
        this.hpCurrent = data.hpCurrent ?? data.hp
        this.mpCurrent = data.mpCurrent ?? data.mp

        this.atk       = data.atk
        this.def       = data.def
        this.mag       = data.mag
        this.res       = data.res
        this.spd       = data.spd
        this.lck       = data.lck

        this.skills        = data.skills ?? ['attack']
        this.statusEffects = data.statusEffects ?? []

        // CTB — initialisé aléatoirement pour varier le premier tour
        this.ctbTimer  = Math.floor(Math.random() * 50)

        // Visuel (pour affichage)
        this.color     = data.color ?? 0xffffff
        this.size      = data.size  ?? 48
        this.xp        = data.xp   ?? 0
        this.gold      = data.gold ?? 0
    }

    isAlive()  { return this.hpCurrent > 0 }
    isDead()   { return this.hpCurrent <= 0 }

    takeDamage(amount) {
        this.hpCurrent = Math.max(0, this.hpCurrent - amount)
    }

    heal(amount) {
        this.hpCurrent = Math.min(this.hpMax, this.hpCurrent + amount)
    }

    useMp(amount) {
        this.mpCurrent = Math.max(0, this.mpCurrent - amount)
    }
}