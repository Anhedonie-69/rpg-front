import Layout from '../components/layout/Layout'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import NewsPanel from '../components/ui/NewsPanel'
import { useDispatch, useSelector } from 'react-redux'
import { newGame, loadSave } from '../features/game/gameSlice'

export default function Dashboard() {

    const { t } = useTranslation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const gameState = useSelector(state => state.game)

    const handleNewGame = () => {
        dispatch(newGame())
        navigate('/game')
    }

    const handleContinue = () => {
        // Vérifie qu'une partie existe
        if (!gameState.isPlaying) {
            alert('Aucune partie en cours !')
            return
        }
        navigate('/game')
    }

    return (
      <Layout>
        <div className="flex items-start justify-center mt-20 gap-10 px-6">
          
          {/* Gauche - actions */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={handleNewGame}
                    className="px-4 py-2 bg-green-600 rounded text-center"
                >
                    {t('dashboard.newGame')}
                </button>
                <button
                    onClick={handleContinue}
                    className={`px-4 py-2 rounded text-center ${
                        gameState.isPlaying
                            ? 'bg-green-600'
                            : 'bg-gray-600 cursor-not-allowed'
                    }`}
                >
                    {t('dashboard.continue')}
                </button>
                <Link to="/options" className="px-4 py-2 bg-green-600 rounded text-center">
                    {t('dashboard.options')}
                </Link>
            </div>
    
          {/* Droite - news */}
          <NewsPanel />
    
        </div>
      </Layout>
    )  
}