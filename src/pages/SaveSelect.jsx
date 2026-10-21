import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/layout/Layout'
import { authFetch } from '../services/auth.service'
import { loadSave, setHasSave } from '../features/game/gameSlice'

export default function SaveSelect() {
    const { t }        = useTranslation()
    const dispatch     = useDispatch()
    const navigate     = useNavigate()
    const [saves, setSaves]     = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authFetch('/api/saves')
            .then(res => res.json())
            .then(data => {
                setSaves(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const handleLoad = (save) => {
        dispatch(loadSave(save))
        navigate('/game')
    }

    const handleDelete = async (slot) => {
        if (!window.confirm(`Effacer la sauvegarde du slot ${slot} ?`)) return

        try {
            const res = await authFetch(`/api/saves/${slot}`, { method: 'DELETE' })
            if (res.ok) {
                // Recharge les saves
                const savesRes = await authFetch('/api/saves')
                const data     = await savesRes.json()
                setSaves(data)

                // Met à jour hasSave dans Redux
                dispatch(setHasSave(data.some(s => !s.empty)))
            }
        } catch (err) {
            console.error('Erreur suppression:', err)
        }
    }

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    }

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center mt-20">
                <p className="text-gray-400">Chargement...</p>
            </div>
        </Layout>
    )

    return (
        <Layout>
            <div className="flex flex-col items-center mt-10 gap-6 px-4">
                <h1 className="text-3xl font-bold">Sélection de sauvegarde</h1>

                <div className="flex flex-col gap-4 w-full max-w-lg">
                    {saves.map(save => (
                        <div
                            key={save.slot}
                            className={`rounded p-4 border ${
                                save.empty
                                    ? 'bg-gray-900 border-gray-700'
                                    : 'bg-gray-800 border-blue-700'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-yellow-400">
                                        Slot {save.slot}
                                    </p>
                                    {save.empty ? (
                                        <p className="text-gray-500 text-sm">Vide</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-300">
                                                Map : {save.mapId}
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                Temps : {formatTime(save.playTime)} | Or : {save.gold}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(save.updatedAt).toLocaleString('fr-FR')}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {!save.empty && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleLoad(save)}
                                            className="px-4 py-2 bg-blue-600 rounded text-sm"
                                        >
                                            Charger
                                        </button>
                                        <button
                                            onClick={() => handleDelete(save.slot)}
                                            className="px-4 py-2 bg-red-700 rounded text-sm"
                                        >
                                            Effacer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-gray-400"
                >
                    ← Retour
                </button>
            </div>
        </Layout>
    )
}