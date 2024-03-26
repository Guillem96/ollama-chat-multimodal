import { createContext } from "react"
import { useChatController } from "../hooks/useChatController"

export const ChatContext = createContext<ReturnType<
  typeof useChatController
> | null>(null)

interface ChatProvider {
  model: string
  children: JSX.Element | JSX.Element[]
}

export default function ChatProvider({ children, model }: ChatProvider) {
  const chatController = useChatController(model)

  return (
    <ChatContext.Provider value={{ ...chatController }}>
      {children}
    </ChatContext.Provider>
  )
}
