import { Bubble } from "./Bubble"
import { OllamaIcon } from "./icons"
import { useChatContext } from "./hooks/useChatContext"
import ChatInput from "./ChatInput"

export default function Chat() {
  const {
    chatHistory,
    currentMessage,
    addUserMessage,
    clearError,
    loading,
    errorMessage,
  } = useChatContext()

  return (
    <div className="flex flex-col relative gap-2 grow h-full max-w-[80%]">
      <ul className="shadow-md rounded-md relative bg-foreground p-4 h-full overflow-scroll">
        {chatHistory.length > 0 ? (
          chatHistory.map((msg, index) => <Bubble key={index} message={msg} />)
        ) : (
          <div className="text-center mt-40">
            <span className="flex items-center justify-center bg-white rounded-full w-20 h-20 mx-auto mb-5">
              <OllamaIcon width={40} color="black" />
            </span>
            <h2 className="text-bold text-4xl">How can I help today?</h2>
          </div>
        )}
        {currentMessage ? <Bubble message={currentMessage} /> : null}
        {!currentMessage && loading ? (
          <Bubble message={{ role: "assistant", content: "..." }} />
        ) : null}

        {errorMessage ? (
          <p
            onClick={clearError}
            className="sticky mx-auto w-[50%] bottom-0 text-black bg-red-300 rounded-md p-3 hover:cursor-pointer"
          >
            {errorMessage}
          </p>
        ) : null}
      </ul>
      <ChatInput onSend={addUserMessage} />
    </div>
  )
}
