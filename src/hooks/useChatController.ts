import { useEffect, useReducer } from "react"
import type { OllamaChatChunk, OllamaChatMessage, ChatState } from "../types"
import { chat } from "../services/ollama"
import {
  addPreviousChatLocalStorage,
  fetchCurrentChatLocalStorage,
  updateCurrentChatLocalStorage,
} from "../services/localStorage"

const uuidv4 = () => {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  )
}

export const chatInitialState: ChatState = fetchCurrentChatLocalStorage() || {
  id: uuidv4(),
  chatHistory: [],
  currentMessage: null,
  loading: false,
  errorMessage: null,
}

export enum CHAT_ACTION_TYPES {
  CLEAR_CHAT_HISTORY = "CLEAR_CHAT_HISTORY",
  ADD_TOKEN_TO_CURRENT_MESSAGE = "ADD_TOKEN_TO_CURRENT_MESSAGE",
  ADD_USER_MESSAGE = "ADD_USER_MESSAGE",
  SET_ERROR = "SET_ERROR",
  CLEAR_ERROR = "CLEAR_ERROR",
  RESTORE = "RESTORE",
}

export type Action =
  | { type: CHAT_ACTION_TYPES.CLEAR_CHAT_HISTORY }
  | {
      type: CHAT_ACTION_TYPES.ADD_TOKEN_TO_CURRENT_MESSAGE
      payload: OllamaChatChunk
    }
  | { type: CHAT_ACTION_TYPES.ADD_USER_MESSAGE; payload: OllamaChatMessage }
  | { type: CHAT_ACTION_TYPES.CLEAR_ERROR }
  | { type: CHAT_ACTION_TYPES.SET_ERROR; payload: string }
  | { type: CHAT_ACTION_TYPES.RESTORE; payload: ChatState }

const chatReducer = (state: ChatState, action: Action): ChatState => {
  const { type: actionType } = action

  if (actionType === CHAT_ACTION_TYPES.CLEAR_CHAT_HISTORY) {
    if (state.chatHistory.length === 0) return state // Nothing to do because there's no messages

    const newState = {
      ...state,
      id: uuidv4(),
      chatHistory: [],
      loading: false,
      currentMessage: null,
      errorMessage: null,
    }

    // Stores the current chat to previous chats
    addPreviousChatLocalStorage(state)

    // Sets the current local storage chat to the new state
    updateCurrentChatLocalStorage(newState)
    return newState
  }

  if (actionType === CHAT_ACTION_TYPES.RESTORE) {
    // If when restoring an old chat, the current has at least one message,
    // we store it as a previous chat
    if (state.chatHistory.length > 0) addPreviousChatLocalStorage(state)

    // Update current local storage chat and return the new state
    updateCurrentChatLocalStorage(action.payload)
    return action.payload
  }

  if (actionType === CHAT_ACTION_TYPES.ADD_TOKEN_TO_CURRENT_MESSAGE) {
    const { payload } = action
    if (state.currentMessage === null) {
      // When we have no current message it means we are receiving the first token from the
      // API
      return {
        ...state,
        loading: true,
        currentMessage: {
          role: "assistant",
          content: payload.message.content,
        },
      }
    }

    if (payload.done) {
      // If message is completed we move the current message to the chat history
      // and restore the current message to null
      const completedMessage: OllamaChatMessage = {
        role: "assistant",
        content: state.currentMessage.content + payload.message.content,
      }
      const newState = {
        ...state,
        loading: false,
        chatHistory: [...state.chatHistory, completedMessage],
        currentMessage: null,
      }
      updateCurrentChatLocalStorage(newState)
      return newState
    }

    // New token, but it is not the first one
    return {
      ...state,
      currentMessage: {
        role: "assistant",
        content: state.currentMessage.content + payload.message.content,
      },
    }
  }

  if (actionType === CHAT_ACTION_TYPES.ADD_USER_MESSAGE) {
    // User sends a prompt, we start loading assuming LLM has to generate an answer
    return {
      ...state,
      chatHistory: [...state.chatHistory, action.payload],
      loading: true,
    }
  }

  if (actionType === CHAT_ACTION_TYPES.CLEAR_ERROR) {
    return { ...state, errorMessage: null, loading: false }
  }

  if (actionType === CHAT_ACTION_TYPES.SET_ERROR) {
    return { ...state, errorMessage: action.payload, loading: false }
  }

  throw new Error(`Unexpected action type: ${actionType}`)
}

export const useChatController = (model: string) => {
  const [state, dispatch] = useReducer(chatReducer, chatInitialState)
  const { chatHistory, currentMessage, loading, errorMessage } = state

  const clearError = () => {
    dispatch({ type: CHAT_ACTION_TYPES.CLEAR_ERROR })
  }

  const clearChat = () => {
    dispatch({ type: CHAT_ACTION_TYPES.CLEAR_CHAT_HISTORY })
  }

  const restoreChat = (newState: ChatState) => {
    if (newState.id === state.id) return
    dispatch({ type: CHAT_ACTION_TYPES.RESTORE, payload: newState })
  }

  const addUserMessage = (userMsg: OllamaChatMessage) => {
    dispatch({ type: CHAT_ACTION_TYPES.ADD_USER_MESSAGE, payload: userMsg })
  }

  useEffect(() => {
    // Whenever there's a change in the chat history, we check if it is
    // a message posted by the user. If it is so, we invoke the chat endpoint
    if (
      chatHistory.length === 0 ||
      chatHistory[chatHistory.length - 1]?.role === "assistant"
    )
      return

    chat([...chatHistory], model)
      .then(async (tokenGenerator: AsyncGenerator<OllamaChatChunk>) => {
        try {
          for await (const token of tokenGenerator) {
            dispatch({
              type: CHAT_ACTION_TYPES.ADD_TOKEN_TO_CURRENT_MESSAGE,
              payload: token,
            })
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error(error)

            dispatch({
              type: CHAT_ACTION_TYPES.SET_ERROR,
              payload: error.message,
            })
          }
        }
      })
      .catch((err: Error) => {
        console.error(err)
        dispatch({
          type: CHAT_ACTION_TYPES.SET_ERROR,
          payload: err.message,
        })
      })
  }, [chatHistory])

  return {
    chat: state,
    chatHistory,
    currentMessage,
    errorMessage,
    loading,
    addUserMessage,
    clearError,
    clearChat,
    restoreChat,
  }
}
