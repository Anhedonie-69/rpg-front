import Phaser from 'phaser'
import i18next from 'i18next'
import { fetchDialogue } from '../../services/dialogue.service'

export default class DialogueScene extends Phaser.Scene {
    constructor() {
        super('DialogueScene')
    }

    init(data) {
        this.dialogueId  = data.dialogueId
        this.npcName     = data.npcName
        this.dialogue    = null
        this.currentNode = 'start'
    }

    async create() {
        const { width, height } = this.scale

        // Charge le dialogue depuis Symfony
        try {
            this.dialogue = await fetchDialogue(this.dialogueId)
        } catch (err) {
            console.error('Dialogue introuvable:', err)
            this.closeDialogue()
            return
        }

        // Conteneur principal en bas de l'écran
        this.container = this.add.container(0, 0).setDepth(20)

        // Fond dialogue
        this.bg = this.add.rectangle(
            width / 2, height - 160,
            width - 40, 200,
            0x000022, 0.92
        ).setStrokeStyle(1, 0x4444aa)
        this.container.add(this.bg)

        // Nom du speaker
        this.speakerText = this.add.text(
            60, height - 240,
            this.dialogue.speaker,
            { fontSize: '14px', fill: '#ffcc00', fontStyle: 'bold',
              backgroundColor: '#000022', padding: { x: 8, y: 4 } }
        )
        this.container.add(this.speakerText)

        // Texte principal
        this.mainText = this.add.text(
            60, height - 215,
            '',
            { fontSize: '15px', fill: '#ffffff',
              wordWrap: { width: width - 120 } }
        )
        this.container.add(this.mainText)

        // Conteneur des choix
        this.choicesContainer = this.add.container(0, 0)
        this.container.add(this.choicesContainer)

        // Affiche le premier nœud
        this.showNode('start')

        // Touche Échap pour fermer
        this.input.keyboard.on('keydown-ESC', () => this.closeDialogue())
    }

    showNode(nodeId) {
        const node = this.dialogue.nodes[nodeId]
        if (!node) { this.closeDialogue(); return }

        this.currentNode = nodeId
        this.mainText.setText(node.text)
        this.choicesContainer.removeAll(true)

        const { width, height } = this.scale
        const choiceCount = node.choices.length

        // Hauteur dynamique selon nombre de choix
        const boxHeight = 120 + Math.max(choiceCount, 1) * 35
        
        // Repositionne le fond
        this.bg.setSize(width - 40, boxHeight)
        this.bg.setPosition(width / 2, height - boxHeight / 2 - 20)

        // Repositionne le texte principal
        this.mainText.setPosition(60, height - boxHeight - 10)
        this.speakerText.setPosition(60, height - boxHeight - 30)

        if (choiceCount === 0) {
            const closeText = this.add.text(
                width - 80, height - 40,
                i18next.t('game.dialogue.close'),
                { fontSize: '13px', fill: '#aaaaaa' }
            ).setOrigin(1, 0.5)
            this.choicesContainer.add(closeText)
            this.input.keyboard.once('keydown-E', () => this.closeDialogue())
            return
        }

        node.choices.forEach((choice, i) => {
            const y = height - boxHeight + 30 + i * 35
            const choiceText = this.add.text(70, y, `› ${choice.text}`, {
                fontSize: '14px', fill: '#ccccff', padding: { x: 4, y: 2 }
            }).setInteractive({ useHandCursor: true })

            choiceText.on('pointerover', () => choiceText.setStyle({ fill: '#ffff00' }))
            choiceText.on('pointerout',  () => choiceText.setStyle({ fill: '#ccccff' }))
            choiceText.on('pointerdown', () => {
                choice.next === 'end' ? this.closeDialogue() : this.showNode(choice.next)
            })

            this.choicesContainer.add(choiceText)
        })
    }

    closeDialogue() {
        this.children.removeAll(true)

        // Débloque le joueur dans la scène d'origine
        const originScene = this.scene.get(this.originScene ?? 'TestScene')
        if (originScene?.playerManager) {
            originScene.playerManager.setActive(true)
        }
        
        this.scene.stop('DialogueScene')
        // Pas de resume → TestScene continue de tourner !
    }
}