import type {
  OllamaModel,
  OllamaAPIModel,
  OllamaAPIModels,
  OllamaErrorMessage,
  OllamaChatMessage,
  OllamaChatChunk,
} from "../types.d"

const API_URL = "http://localhost:11434/api"

export const listModels = async () => {
  const res = await fetch(`${API_URL}/tags`)
  const models = (await res.json()) as OllamaAPIModels
  return models.models.map((apiModel: OllamaAPIModel) => {
    return {
      name: apiModel.name,
      model: apiModel.model,
      size: apiModel.size,
      readableSize: humanFileSize(apiModel.size),
      quantization: apiModel.details.quantization_level,
      nParameters: apiModel.details.parameter_size,
    } as OllamaModel
  })
}

export const chat = async (
  messages: OllamaChatMessage[],
  model: string,
): Promise<AsyncGenerator<OllamaChatChunk>> => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    body: JSON.stringify({
      model,
      messages,
    }),
  })

  if (!res.body) throw new Error("Missing response body /chat")

  const itr = parseJSON<OllamaChatChunk | OllamaErrorMessage>(res.body)
  return createMessageIterator(itr) as AsyncGenerator<OllamaChatChunk>
}

const humanFileSize = (bytes: number, dp: number = 1) => {
  if (Math.abs(bytes) < 1024) {
    return bytes + " B"
  }

  const units = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= 1024
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= 1024 && u < units.length - 1)

  return bytes.toFixed(dp) + " " + units[u]
}

const createMessageIterator = (
  itr: AsyncGenerator<
    OllamaGenerationChunk | OllamaChatChunk | OllamaErrorMessage
  >,
) => {
  return (async function* () {
    for await (const message of itr) {
      if ("error" in message) {
        throw new Error(message.error)
      }
      yield message
      if (message.done) {
        return
      }
    }
    throw new Error("Did not receive done response in stream.")
  })()
}

const parseJSON = async function* <T = unknown>(
  itr: ReadableStream<Uint8Array>,
): AsyncGenerator<T> {
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  const reader = itr.getReader()

  while (true) {
    const { done, value: chunk } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(chunk)

    const parts = buffer.split("\n")

    buffer = parts.pop() ?? ""

    for (const part of parts) {
      try {
        yield JSON.parse(part)
      } catch (error) {
        console.warn("invalid json: ", part)
      }
    }
  }

  for (const part of buffer.split("\n").filter((p) => p !== "")) {
    try {
      yield JSON.parse(part)
    } catch (error) {
      console.warn("invalid json: ", part)
    }
  }
}
