'use client'

import { MODELS, estimateCost, formatUSD, formatDuration, type ModelPricing } from '@/lib/cost'

interface CostEstimateProps {
  durationSeconds: number
  selectedModel: ModelPricing
  onModelChange: (model: ModelPricing) => void
}

export function CostEstimate({ durationSeconds, selectedModel, onModelChange }: CostEstimateProps) {
  const estimate = estimateCost(durationSeconds, selectedModel)

  return (
    <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Coste estimado</p>
        <span className="text-xs text-gray-600">Duración: {formatDuration(durationSeconds)}</span>
      </div>

      {/* Model selector */}
      <div className="flex gap-2">
        {MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model)}
            className={`flex-1 text-xs py-2 px-3 rounded-lg border transition-colors font-medium ${
              selectedModel.id === model.id
                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-[#2a2a3a] text-gray-500 hover:border-gray-600'
            }`}
          >
            {model.name}
          </button>
        ))}
      </div>

      {/* Token breakdown */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-500">
          <span>Tokens vídeo ({formatDuration(durationSeconds)} × 258/seg)</span>
          <span>{estimate.videoTokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tokens prompt</span>
          <span>~{estimate.promptTokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tokens output (estimado)</span>
          <span>~{estimate.estimatedOutputTokens.toLocaleString()}</span>
        </div>
        <div className="border-t border-[#2a2a3a] pt-1.5 flex justify-between text-gray-400">
          <span>Total tokens entrada</span>
          <span>{estimate.totalInputTokens.toLocaleString()}</span>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="bg-[#0a0a0f] rounded-lg p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-500">
          <span>Entrada ({formatUSD(selectedModel.inputPricePerMToken)}/M tokens)</span>
          <span>{formatUSD(estimate.inputCostUSD)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Salida ({formatUSD(selectedModel.outputPricePerMToken)}/M tokens)</span>
          <span>{formatUSD(estimate.outputCostUSD)}</span>
        </div>
        <div className="flex justify-between font-semibold text-orange-400 border-t border-[#2a2a3a] pt-1.5">
          <span>Coste total estimado</span>
          <span>{formatUSD(estimate.totalCostUSD)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        * Estimación basada en precios oficiales de Google AI. El coste real puede variar según la respuesta del modelo.
      </p>
    </div>
  )
}
