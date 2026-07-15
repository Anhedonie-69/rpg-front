import { authFetch } from '../../services/auth.service'
import BattleMember from './BattleMember'

export default class BattleManager {
    constructor(scene) {
        this.scene    = scene
        this.party    = []    // BattleMember[]
        this.enemies  = []    // données ennemis
        this.actors   = []    // tous les acteurs (party + ennemis)
        this.isActive = false
        this.currentActor = null
    }

    // Initialise le combat
    async init(zone = 'default') {
        // Charge l'équipe
        const partyRes  = await authFetch('/api/characters')
        const partyData = await partyRes.json()
        this.party = partyData
            .filter(c => c.unlocked)
            .map(c => new BattleMember(c, 'character'))

        // Charge les ennemis selon la zone
        const enemyRes  = await authFetch(`/api/battle/enemies?zone=${zone}`)
        const enemyData = await enemyRes.json()
        this.enemies = enemyData.map((e, i) => new BattleMember({
            ...e,
            id:       `${e.id}_${i}`,  // id unique pour les sprites
            enemyId:  e.id,             // ← id original pour l'API
            hpCurrent: e.hp,
            mpCurrent: e.mp,
        }, 'enemy'))

        // Tous les acteurs ensemble pour le CTB
        this.actors = [...this.party, ...this.enemies]

        this.isActive = true
        return this
    }

    // Prochain acteur selon CTB
    getNextActor() {
        // Tick tous les acteurs
        let iterations = 0
        while (true) {
            iterations++
            if (iterations > 1000) break // sécurité boucle infinie

            for (const actor of this.actors) {
                if (!actor.isAlive()) continue
                actor.ctbTimer += actor.spd

                if (actor.ctbTimer >= 100) {
                    actor.ctbTimer -= 100
                    return actor
                }
            }
        }
        return null
    }

    // Ordre des N prochains acteurs (pour affichage CTB)
    getCtbOrder(count = 8) {
        // Clone les acteurs pour simuler sans modifier l'état réel
        const simActors = this.actors
            .filter(a => a.isAlive())
            .map(a => ({
                ...a,
                ctbTimer: a.ctbTimer,
                name:     a.name,
                type:     a.type,
            }))

        const order = []
        let iterations = 0

        while (order.length < count) {
            iterations++
            if (iterations > 10000) break

            for (const actor of simActors) {
                actor.ctbTimer += actor.spd
                if (actor.ctbTimer >= 100) {
                    actor.ctbTimer -= 100
                    order.push({
                        name: actor.name,
                        type: actor.type,
                        id:   actor.id,
                    })
                    if (order.length >= count) break
                }
            }
        }

        return order
    }

    // Calcule et applique les dégâts via Symfony
    async performAttack(attacker, target) {
        try {
            const res  = await authFetch('/api/battle/damage', {
                method: 'POST',
                body: JSON.stringify({
                    attackerId:   attacker.type === 'enemy' ? attacker.enemyId : attacker.id,
                    targetId:     target.type   === 'enemy' ? target.enemyId   : target.id,
                    skillId:      'attack',
                    attackerType: attacker.type,
                    targetType:   target.type,
                })
            })
            const data = await res.json()

            // Applique les dégâts
            target.takeDamage(data.damage)

            return {
                damage: data.damage,
                isCrit: data.isCrit,
                target: target,
            }
        } catch (err) {
            console.error('Erreur calcul dégâts:', err)
            return null
        }
    }

    // IA ennemie simple
    getEnemyAction(enemy) {
        // Cible un personnage vivant aléatoire
        const aliveParty = this.party.filter(m => m.isAlive())
        if (aliveParty.length === 0) return null

        const target = aliveParty[Math.floor(Math.random() * aliveParty.length)]
        return { skill: 'attack', target }
    }

    // Vérifie fin de combat
    checkBattleEnd() {
        if (this.party.every(m => !m.isAlive())) return 'defeat'
        if (this.enemies.every(e => !e.isAlive()))  return 'victory'
        return null
    }

    getParty()   { return this.party }
    getEnemies() { return this.enemies }
    getActors()  { return this.actors }
}