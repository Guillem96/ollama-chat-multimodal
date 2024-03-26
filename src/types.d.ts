export interface OllamaAPIModels {
  models: Model[]
}

export interface OllamaAPIModel {
  name: string
  model: string
  size: number
  details: Details
}

export interface OllamaModelAPIDetails {
  format: string
  family: string
  families?: string[]
  parameter_size: string
  quantization_level: string
}

export interface OllamaModel {
  name: string
  model: string
  size: number
  family: string
  readableSize: string
  quantization: string
  nParameters: string
}

export interface OllamaChatChunk {
  message: OllamaChatMessage
  done: boolean
}

export interface OllamaErrorMessage {
  error: string
}

export interface OllamaChatMessage {
  role: "user" | "assistant"
  content: string
  images?: string[]
}

export interface ChatState {
  id: string
  chatHistory: OllamaChatMessage[]
  currentMessage: OllamaChatMessage | null
  loading: boolean
  errorMessage: string | null
}
