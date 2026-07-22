import Phaser from 'phaser'
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
        const bg = this.add.rectangle(
            width / 2, height - 160,
            width - 40, 200,
            0x000022, 0.92
        ).setStrokeStyle(1, 0x4444aa)
        this.container.add(bg)

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
        if (!node) {
            this.closeDialogue()
            return
        }

        this.currentNode = nodeId
        this.mainText.setText(node.text)

        // Nettoie les choix précédents
        this.choicesContainer.removeAll(true)

        const { width, height } = this.scale

        if (node.choices.length === 0) {
            // Pas de choix → juste [E] pour fermer
            const closeText = this.add.text(
                width - 80, height - 70,
                '[E] Fermer',
                { fontSize: '13px', fill: '#aaaaaa' }
            ).setOrigin(1, 0.5)
            this.choicesContainer.add(closeText)

            this.input.keyboard.once('keydown-E', () => this.closeDialogue())
            return
        }

        // Affiche les choix
        node.choices.forEach((choice, i) => {
            const y = height - 130 + i * 30

            const choiceText = this.add.text(
                70, y,
                `› ${choice.text}`,
                { fontSize: '14px', fill: '#ccccff',
                  backgroundColor: '#00000000',
                  padding: { x: 4, y: 2 } }
            ).setInteractive({ useHandCursor: true })

            // Hover
            choiceText.on('pointerover', () => {
                choiceText.setStyle({ fill: '#ffff00' })
            })
            choiceText.on('pointerout', () => {
                choiceText.setStyle({ fill: '#ccccff' })
            })

            // Clic
            choiceText.on('pointerdown', () => {
                if (choice.next === 'end') {
                    this.closeDialogue()
                } else {
                    this.showNode(choice.next)
                }
            })

            this.choicesContainer.add(choiceText)
        })
    }

    closeDialogue() {
        this.children.removeAll(true)
        this.scene.stop('DialogueScene')
        // Pas de resume → TestScene continue de tourner !
    }
}