import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

type AIProvider = 'anthropic' | 'openai'

function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase()
  if (provider === 'openai') return 'openai'
  return 'anthropic' // default
}

function getModel(): string {
  if (process.env.AI_MODEL) return process.env.AI_MODEL
  // Default models per provider
  return getProvider() === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-6'
}

export async function callAI(prompt: string): Promise<string> {
  const provider = getProvider()
  const model = getModel()

  if (provider === 'openai') {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.chat.completions.create({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })
    return response.choices[0]?.message?.content ?? ''
  }

  // Anthropic (default)
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  return response.content[0].type === 'text' ? response.content[0].text : ''
}
