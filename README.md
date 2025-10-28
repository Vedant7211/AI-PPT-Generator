# AI Slides Generator (Next.js)

An AI-powered PowerPoint (.pptx) slide generator built with Next.js App Router. Enter a prompt, get a structured deck, preview it in the browser, edit slide titles/bullets, and download a polished PPTX.

This repository currently contains one app in `ppt-generator/`.

## Features
- **Prompt → Slides**: Uses Google Generative AI to generate a slide outline (title + bullet points per slide)
- **Live Preview**: Renders a PPTX preview in the browser
- **Slide Editor**: Switch to editor mode to refine titles and bullets
- **One‑click Download**: Generates a .pptx via `pptxgenjs` entirely in the browser
- **History**: Saves and reloads previous generations locally (`data/history.json`)
- **Dark Mode**: Theme toggle with `next-themes`

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Google Generative AI SDK (`@google/generative-ai`)
- PPTX generation with `pptxgenjs`
- UI primitives from Radix UI and custom components

## Repository Structure
```
/indianAppgu
  └─ ppt-generator/
     ├─ app/
     │  ├─ api/
     │  │  ├─ generate-slides/route.ts   # Calls Google Generative AI and returns structured slides
     │  │  ├─ history/route.ts           # Simple JSON-based history store (GET/POST)
     │  │  └─ upload-pptx/route.ts       # Saves uploaded .pptx into /public/temp_pptx
     │  ├─ components/                   # UI components (sidebar, search bar, editor, preview)
     │  ├─ globals.css                   # Tailwind base styles
     │  ├─ layout.tsx                    # App layout and theme provider
     │  └─ page.tsx                      # Main UI and client logic
     ├─ lib/pptGenerator.ts              # PPTX creation logic (styles, title/content slides)
     ├─ data/history.json                # Local persistence for history (JSON file)
     ├─ public/temp_pptx/                # Temp storage for uploaded/generated files (public)
     ├─ next.config.ts, tsconfig.json, eslint, etc.
     └─ package.json
```

## Prerequisites
- Node.js 18+ (LTS recommended)
- A Google Generative AI API key

## Quick Start
```bash
# 1) Go to the app
cd ppt-generator

# 2) Install deps
npm install

# 3) Configure env
# Create the env file and add your key
printf "GOOGLE_API_KEY=your_key_here\n" > .env.local

# 4) Run dev server
npm run dev

# Visit http://localhost:3000
```

### Environment Variables
Create `ppt-generator/.env.local` with:
```
GOOGLE_API_KEY=your_key_here
```

## Usage
1. Open the app and enter a prompt (e.g., "AI in Healthcare: market trends and challenges").
2. The app calls `/api/generate-slides` to produce a slide outline.
3. Preview the deck. Toggle to Edit to refine titles and bullet points.
4. Download the PPTX. You can also reload previous sessions from the sidebar (History).

## API Routes (App Router)
- POST `/api/generate-slides`
  - Body: `{ "prompt": string }`
  - Returns: `{ "slides": Array<{ title: string; content: string[] }> }`
  - Notes: Requires `GOOGLE_API_KEY`; uses `@google/generative-ai`.

- GET `/api/history`
  - Returns: `{ items: HistoryItem[] }` (newest first)

- POST `/api/history`
  - Body: `{ sessionId?: string, prompt?: string, slides?: Slide[], messages?: ChatMessage[] }`
  - Behavior: Creates a new session or updates an existing one; persists to `data/history.json`.

- POST `/api/upload-pptx`
  - Multipart form with `file` (.pptx)
  - Returns: `{ url: string }` in `/public/temp_pptx`.

Type shapes are defined inline in routes; slide shape is consistently `{ title: string; content: string[] }`.

## Building and Deployment
```bash
# From ppt-generator/
npm run build
npm start  # serves production build
```

- **Vercel**: Works well out of the box for the frontend and `/api/generate-slides`. Set `GOOGLE_API_KEY` in project settings.
- **Persistence**: `data/history.json` and writing to `public/temp_pptx` are filesystem writes. On serverless platforms, these are ephemeral and not shared across instances. For production, back these with a real store:
  - History: Use a database (e.g., Postgres, MongoDB, KV) instead of `data/history.json`.
  - Uploads: Use object storage (e.g., S3, GCS) instead of `public/temp_pptx`.

## Troubleshooting
- **Missing API key**: `/api/generate-slides` responds with 500 and `{ error: 'API key not configured' }`. Ensure `GOOGLE_API_KEY` is set and the project is restarted.
- **JSON parse errors from AI**: The route attempts to unwrap Markdown code fences; if generation returns non‑JSON, you’ll see a 500. Retry with a clearer prompt.
- **File write errors**: Ensure the process can write to `ppt-generator/data` and `ppt-generator/public/temp_pptx` in local/dev. Use persistent storage in prod.

## License
MIT

## Acknowledgements
- Next.js team for the framework
- Google Generative AI for content generation
- `pptxgenjs` for PPTX creation
