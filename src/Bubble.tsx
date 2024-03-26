import { OllamaIcon } from "./icons"
import Markdown from "react-markdown"
import { OllamaChatMessage } from "./types"
import ChatImage from "./ChatImage"

export interface Props {
  message: OllamaChatMessage
  generating?: boolean
}

export function Bubble({ message: { role, content, images } }: Props) {
  const isAssistantMessage = role == "assistant"
  const bgColor = isAssistantMessage ? "bg-accent/40" : "bg-green-50/40"
  const align = isAssistantMessage ? "justify-start" : "justify-end"

  let imagesToRender = <></>
  if (images?.length ?? 0 > 0) {
    imagesToRender = (
      <div className="flex flex-row gap-x-4 justify-end pt-2">
        {images?.map((imgSrc) => (
          <ChatImage
            key={imgSrc}
            src={`data:image;base64,${imgSrc}`}
            height="45px"
          />
        ))}
      </div>
    )
  }

  return (
    <li className={`${align} flex flex-row gap-x-4 mb-4 text-wrap`}>
      {isAssistantMessage ? (
        <span className="flex items-center justify-center bg-white rounded-full w-10 h-10">
          <OllamaIcon width={20} color="black" />
        </span>
      ) : null}
      <div className={`max-w-[85%] rounded-lg p-4 ${bgColor}`}>
        <Markdown className="inline-block">{content || " "}</Markdown>
        {imagesToRender}
      </div>
      {!isAssistantMessage ? (
        <span className="flex items-center justify-center bg-white rounded-full w-10 h-10">
          <OllamaIcon width={20} color="black" />
        </span>
      ) : null}
    </li>
  )
}
