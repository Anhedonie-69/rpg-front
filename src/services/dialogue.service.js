import { authFetch } from './auth.service'

export const fetchDialogue = async (dialogueId) => {
    const res = await authFetch(`/api/dialogue/${dialogueId}`)
    if (!res.ok) throw await res.json()
    return res.json()
}