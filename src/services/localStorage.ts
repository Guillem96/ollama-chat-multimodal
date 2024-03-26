import type { ChatState } from "../types.d"

export const updateCurrentChatLocalStorage = (state: ChatState) => {
  window.localStorage.setItem("__currentChat", JSON.stringify(state))
}

export const clearCurrentChatLocalStorage = () => {
  window.localStorage.removeItem("__currentChat")
}

export const addPreviousChatLocalStorage = (state: ChatState) => {
  const prevStates = fetchPreviousChatsLocalStorage()
  const idx = prevStates.findIndex(({ id }) => id === state.id)
  if (idx === -1) prevStates.push(state)
  else prevStates[idx] = state

  window.localStorage.setItem("__previousChat", JSON.stringify(prevStates))
}

export const fetchCurrentChatLocalStorage = (): ChatState | null => {
  const cc = window.localStorage.getItem("__currentChat")
  if (!cc) return null
  return JSON.parse(cc)
}

export const fetchPreviousChatsLocalStorage = (): ChatState[] => {
  const cc = window.localStorage.getItem("__previousChat")
  if (!cc) return []
  return JSON.parse(cc)
}

export const deletePreviousChatByIdLocalStorage = (chatId: string): void => {
  const cc = fetchPreviousChatsLocalStorage()
  const newPrevChats = cc.filter(({ id }) => id !== chatId)
  window.localStorage.setItem("__previousChat", JSON.stringify(newPrevChats))
}
