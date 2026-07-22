import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { createGame } from '../phaser/game'

export default function Game() {
    const navigate = useNavigate()
    const gameState = useSelector(state => state.game)

    const TEST_MODE = true

    useEffect(() => {
        // Sécurité — pas de partie active → retour dashboard
        if (!gameState.isPlaying) {
            navigate('/dashboard')
            return
        }

        const game = createGame(TEST_MODE, gameState)
        return () => game.destroy(true)
    }, [])

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-900 text-white">
            <Header />
            <div className="flex-1 overflow-hidden relative">
                <div id="game-container" className="w-full h-full" />
            </div>
        </div>
    )
}