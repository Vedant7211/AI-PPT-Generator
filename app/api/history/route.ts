export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

type ChatMessage = { role: 'user' | 'assistant' | 'thinking'; content: string; createdAt: string }
type HistoryItem = {
  id: string
  prompt?: string
  slides: Array<{ title: string; content: string[] }>
  messages: ChatMessage[]
  createdAt: string
}

const dataDir = path.join(process.cwd(), 'data')
const dataFile = path.join(dataDir, 'history.json')

async function ensureStore() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(dataFile)
  } catch (_) {
    await fs.writeFile(dataFile, JSON.stringify([]), 'utf8')
  }
}

async function readAll(): Promise<HistoryItem[]> {
  await ensureStore()
  const raw = await fs.readFile(dataFile, 'utf8')
  try {
    return JSON.parse(raw) as HistoryItem[]
  } catch {
    return []
  }
}

async function writeAll(items: HistoryItem[]) {
  await ensureStore()
  await fs.writeFile(dataFile, JSON.stringify(items, null, 2), 'utf8')
}

export async function GET() {
  try {
    const items = await readAll()
    // newest first
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load history' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, prompt, slides, messages } = body || {}
    if (!Array.isArray(slides) && !Array.isArray(messages) && !prompt) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const items = await readAll()

    if (sessionId) {
      const idx = items.findIndex(i => i.id === sessionId)
      if (idx === -1) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      const existing = items[idx]
      if (Array.isArray(slides)) existing.slides = slides
      if (Array.isArray(messages)) existing.messages = messages // Replace messages instead of appending
      await writeAll(items)
      return NextResponse.json({ item: existing, sessionId })
    }

    // create new session
    const newItem: HistoryItem = {
      id: uuidv4(),
      prompt,
      slides: Array.isArray(slides) ? slides : [],
      messages: Array.isArray(messages) ? messages : [],
      createdAt: new Date().toISOString(),
    }
    items.push(newItem)
    await writeAll(items)
    return NextResponse.json({ item: newItem, sessionId: newItem.id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save history' }, { status: 500 })
  }
}


