import { useContext } from "react"
import { ChatContext } from "../context/ollama"

export const useChatContext = () => {
  const chatContext = useContext(ChatContext)
  if (!chatContext) {
    throw new Error("ChatContext cannot be imported outside ChatProvider")
  }

  return chatContext
}
