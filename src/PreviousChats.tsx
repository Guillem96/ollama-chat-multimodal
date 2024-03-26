import { useEffect, useState } from "react"
import { useChatContext } from "./hooks/useChatContext"
import {
  deletePreviousChatByIdLocalStorage,
  fetchPreviousChatsLocalStorage,
} from "./services/localStorage"
import { TrashIcon } from "./icons"

export default function PreviousChats() {
  const { chat, clearChat, restoreChat } = useChatContext()
  const [prevChats, setPrevChats] = useState(fetchPreviousChatsLocalStorage())

  const handleRestoreChat = (chatId: string) => {
    const chatToRestore = fetchPreviousChatsLocalStorage().find(
      ({ id }) => id === chatId,
    )
    if (!chatToRestore) return
    restoreChat(chatToRestore)
  }

  const handleDelete = (chatId: string) => {
    // No delete current chat
    if (chatId === chat.id) return

    deletePreviousChatByIdLocalStorage(chatId)
    setPrevChats(fetchPreviousChatsLocalStorage())
  }

  useEffect(() => {
    setPrevChats(fetchPreviousChatsLocalStorage())
  }, [chat.chatHistory])

  const oldChatClasses =
    "flex flex-row items-center bg-foreground my-2 py-4 px-2 rounded-md hover:cursor-pointer max-h-20 text-ellipsis overflow-hidden"
  const activeOldChatClasses = "pointer-events-none brightness-150"

  return (
    <div className="w-[20%] rounded-md overflow-scroll">
      <button
        onClick={clearChat}
        disabled={chat.chatHistory.length === 0}
        className="bg-primary rounded-md w-full h-10 hover:saturate-150 disabled:opacity-30"
      >
        New Chat
      </button>
      <p className="mt-4 text-neutral-400 text-sm">Previous chats</p>
      <ul>
        {prevChats.map((oldChat) => {
          const isActive = chat.id === oldChat.id
          let classes = oldChatClasses
          if (isActive) {
            classes += ` ${activeOldChatClasses}`
          }

          return (
            <>
              <li
                className={classes}
                key={oldChat.id}
                onClick={() => handleRestoreChat(oldChat.id)}
              >
                <p className="grow line-clamp-2">
                  {oldChat.chatHistory[0].content}
                </p>
                {isActive ? null : (
                  <button onClick={() => handleDelete(oldChat.id)}>
                    <TrashIcon />
                  </button>
                )}
              </li>
            </>
          )
        })}
      </ul>
    </div>
  )
}
