import { useEffect } from "react"
import { useOllamaModels } from "./hooks/useOllamaModels"

interface Props {
  currentModel: string
  onChange: (modelName: string) => void
}

export default function ModelSelector({ currentModel, onChange }: Props) {
  const { models, fetchModels } = useOllamaModels()

  useEffect(fetchModels, [])

  return (
    <div className="absolute bottom-2 right-0 z-50 text-xl">
      <select
        name="select"
        onChange={(e) => onChange(e.target.value)}
        className="bg-foreground rounded-md p-2"
      >
        {models.length > 0 ? (
          models.map((m) => {
            if (currentModel === m.name)
              return (
                <option key={m.name} value={m.name} selected>
                  {m.name} - {m.readableSize}
                </option>
              )
            return (
              <option key={m.name} value={m.name}>
                {m.name} - {m.readableSize}
              </option>
            )
          })
        ) : (
          <option value="llava:latest" selected>
            Llava
          </option>
        )}
      </select>
    </div>
  )
}
