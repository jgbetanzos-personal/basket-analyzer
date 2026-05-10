import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'

let client: GoogleGenerativeAI | null = null

export function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    client = new GoogleGenerativeAI(apiKey)
  }
  return client
}

export function getModel() {
  return getClient().getGenerativeModel({ model: 'gemini-2.5-flash' })
}
