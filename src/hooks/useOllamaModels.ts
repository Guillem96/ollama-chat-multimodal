import { useState } from "react"
import { listModels } from "../services/ollama"
import type { OllamaModel } from "../types.d"

export const useOllamaModels = () => {
  const [models, setModels] = useState<OllamaModel[]>([])

  const fetchModels = () => {
    listModels().then(setModels)
  }

  return { models, fetchModels }
}
