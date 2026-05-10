export interface ModelPricing {
  id: string
  name: string
  inputPricePerMToken: number  // USD per million tokens
  outputPricePerMToken: number
  tokensPerSecondVideo: number
}

export const MODELS: ModelPricing[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    inputPricePerMToken: 0.15,
    outputPricePerMToken: 0.60,
    tokensPerSecondVideo: 258,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    inputPricePerMToken: 1.25,
    outputPricePerMToken: 10.00,
    tokensPerSecondVideo: 258,
  },
]

export interface CostEstimate {
  durationSeconds: number
  videoTokens: number
  promptTokens: number
  totalInputTokens: number
  estimatedOutputTokens: number
  inputCostUSD: number
  outputCostUSD: number
  totalCostUSD: number
}

const PROMPT_TOKENS = 400       // approximate prompt size
const OUTPUT_TOKENS_EST = 800   // approximate JSON output

export function estimateCost(durationSeconds: number, model: ModelPricing): CostEstimate {
  const videoTokens = Math.ceil(durationSeconds * model.tokensPerSecondVideo)
  const promptTokens = PROMPT_TOKENS
  const totalInputTokens = videoTokens + promptTokens
  const estimatedOutputTokens = OUTPUT_TOKENS_EST

  const inputCostUSD = (totalInputTokens / 1_000_000) * model.inputPricePerMToken
  const outputCostUSD = (estimatedOutputTokens / 1_000_000) * model.outputPricePerMToken
  const totalCostUSD = inputCostUSD + outputCostUSD

  return {
    durationSeconds,
    videoTokens,
    promptTokens,
    totalInputTokens,
    estimatedOutputTokens,
    inputCostUSD,
    outputCostUSD,
    totalCostUSD,
  }
}

export function formatUSD(amount: number): string {
  if (amount < 0.001) return '< $0.001'
  return `$${amount.toFixed(4)}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read video duration'))
    }
    video.src = url
  })
}
