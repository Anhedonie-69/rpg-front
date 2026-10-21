import Layout from '../components/layout/Layout'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import NewsPanel from '../components/ui/NewsPanel'
import { useDispatch, useSelector } from 'react-redux'
import { newGame } from '../features/game/gameSlice'

export default function Dashboard() {
    const { t }      = useTranslation()
    const dispatch   = useDispatch()
    const navigate   = useNavigate()
    const hasSave    = useSelector(state => state.game.hasSave)

    const handleNewGame = () => {
        dispatch(newGame())
        navigate('/game')  // ← direct, sans /saves
    }

    const handleContinue = () => {
        navigate('/saves')  // ← page de sélection
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
                        onClick={hasSave ? handleContinue : undefined}
                        className={`px-4 py-2 rounded text-center ${
                            hasSave
                                ? 'bg-blue-600 cursor-pointer'
                                : 'bg-gray-600 cursor-not-allowed opacity-50'
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