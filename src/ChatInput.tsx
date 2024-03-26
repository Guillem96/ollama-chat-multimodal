import { useRef, KeyboardEvent, useState } from "react"
import { PaperAirplane, PaperClipIcon } from "./icons"
import { OllamaChatMessage } from "./types"
import ChatImage from "./ChatImage"
import { useChatContext } from "./hooks/useChatContext"

interface Props {
  onSend: (prompt: OllamaChatMessage) => void
}

export default function ChatInput({ onSend }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [loadingImage, setLoadingImage] = useState(false)
  const { loading } = useChatContext()

  const handleClick = () => {
    const currentReference = inputRef.current
    if (!currentReference) return

    const prompt = currentReference.value
    if (!prompt) return
    onSend({
      content: prompt,
      role: "user",
      images: images.map((imgSrc) => imgSrc.split(",")[1]),
    })
    setImages([])

    currentReference.value = ""
    currentReference.focus()
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (loading) {
      event.preventDefault()
      return
    }

    if (event.code === "Enter" || event.code === "NumpadEnter") {
      event.preventDefault()
      handleClick()
    }
  }

  const deleteImage = (imgSrc: string) => {
    setImages(images.filter((o) => o != imgSrc))
  }

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (images.length === 3) {
      return
    }
    setLoadingImage(true)
    const file = (event.target.files ?? [])[0]
    if (file) {
      const fileReader = new FileReader()
      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target) throw new Error("unexpected null file reader")
        const result = event.target.result as string
        if (!images.includes(result)) setImages([...images, result])

        setLoadingImage(false)
      }
      fileReader.readAsDataURL(file)
    }
  }

  return (
    <>
      <div className="h-18 flex flex-row gap-x-4 justify-end">
        {images.map((src) => (
          <ChatImage
            key={src}
            src={src}
            height="45px"
            onClick={() => deleteImage(src)}
          />
        ))}
      </div>
      <div className={`w-full flex flex-row gap-x-4 items-center`}>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Hello Chat!"
          className="rounded-md grow bg-foreground p-3 "
          disabled={loading}
        />
        <div className="h-full upload-image-btn">
          <input
            type="file"
            onChange={changeHandler}
            disabled={loading || images.length >= 3 || loadingImage}
            accept="image/*"
            id="upload-image-inp"
            className="hidden"
            hidden
          />
          <label
            htmlFor="upload-image-inp"
            className="rounded-md h-full w-[64px] hover:cursor-pointer bg-primary flex justify-center items-center disabled:opacity-30"
          >
            <PaperClipIcon />
          </label>
        </div>
        <button
          onClick={handleClick}
          disabled={loading}
          className="rounded-md h-full w-[64px] bg-primary flex justify-center items-center disabled:opacity-30"
        >
          <PaperAirplane />
        </button>
      </div>
    </>
  )
}
