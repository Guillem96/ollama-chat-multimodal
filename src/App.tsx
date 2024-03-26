import "./index.css"
import Chat from "./Chat"
import { GithubIcon } from "./icons"
import ChatProvider from "./context/ollama"
import PreviousChats from "./PreviousChats"
import ModelSelector from "./ModelSelector"
import { useState } from "react"

function App() {
  const [model, setModel] = useState("llava:latest")

  return (
    <div className="max-w-screen-xl mx-auto h-screen max-h-screen py-4 px-4 xl:px-0 overflow-clip">
      <header className="relative h-[8vh] pb-2">
        <h1 className="text-6xl text-center">Ollama Chat</h1>
        <ModelSelector currentModel={model} onChange={setModel} />
      </header>
      <main className="h-[85vh] flex flex-row gap-x-2">
        <ChatProvider model={model}>
          <PreviousChats />
          <Chat />
        </ChatProvider>
      </main>
      <footer className="pt-3 max-h-[5vh]">
        <a
          className="flex flex-row justify-end align-start gap-x-2 hover:underline hover:text-blue-500"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/Guillem96"
        >
          <GithubIcon />
          <p>Made with love</p>
        </a>
      </footer>
    </div>
  )
}

export default App
