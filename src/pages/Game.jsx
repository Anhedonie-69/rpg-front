import { useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { createGame } from '../phaser/game'

export default function Game() {

  useEffect(() => {

    const game = createGame()

    return () => {
      game.destroy(true)
    }

  }, [])

  return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-900 text-white">
          <Header />
    
          <div className="flex-1 overflow-hidden relative">
            <div
              id="game-container"
              className="w-full h-full"
            />
          </div>

        </div>
        
  )
}