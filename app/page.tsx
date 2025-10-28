'use client'

import { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { SearchBar } from "../components/search-bar";
import { ThemeToggle } from "../components/theme-toggle";
import { generatePpt } from "../lib/pptGenerator";
import { Button } from "../components/ui/button";
import { PptxPreview } from "../components/pptx-preview";
import { PptEditor } from "../components/ppt-editor";

interface Slide {
  title: string;
  content: string[];
}

type ChatMessage = {
  role: 'user' | 'assistant' | 'thinking'
  content: string
  createdAt: string
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiResponse, setAiResponse] = useState<Slide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pptxBlobUrl, setPptxBlobUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');

  // Cleanup blob URL on unmount or when new PPTX is generated
  useEffect(() => {
    return () => {
      if (pptxBlobUrl) {
        URL.revokeObjectURL(pptxBlobUrl);
      }
    };
  }, [pptxBlobUrl]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchSend = async (prompt: string) => {
    setLoading(true);
    setAiResponse(null); // Clear previous response
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: prompt, createdAt: new Date().toISOString() },
      { role: 'thinking', content: 'Thinking…', createdAt: new Date().toISOString() },
    ])
    
    // Cleanup previous blob URL
    if (pptxBlobUrl) {
      URL.revokeObjectURL(pptxBlobUrl);
      setPptxBlobUrl(null);
    }
    try {
      const response = await fetch("/api/generate-slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const slides = data.slides; // Expecting data.slides now

      if (Array.isArray(slides) && slides.length > 0) {
        setAiResponse(slides);
        const generatedBlob = await generatePpt(slides, "AI_Generated_Presentation");
        
        // Create a blob URL directly in the browser - no server upload needed!
        const blobUrl = URL.createObjectURL(generatedBlob as Blob);
        setPptxBlobUrl(blobUrl);

        // Append assistant summary message
        const summary = `Created ${slides.length} slides. Title: ${slides[0]?.title || 'Untitled'}`
        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.role !== 'thinking')
          return [...withoutThinking, { role: 'assistant', content: summary, createdAt: new Date().toISOString() }]
        })

        // Save to backend history (create or append session)
        try {
          // Get the full updated message history
          const updatedMessages = messages.filter((m) => m.role !== 'thinking').concat([
            { role: 'assistant', content: summary, createdAt: new Date().toISOString() }
          ])
          
          const res = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              prompt: sessionId ? prompt : prompt, // Use current prompt for new sessions, or keep original for existing
              slides,
              messages: updatedMessages
            })
          })
          const data = await res.json()
          if (!sessionId && data?.sessionId) setSessionId(data.sessionId)
        } catch (e) {
          console.warn('Failed to save history', e);
        }

      } else {
        setAiResponse(null);
        console.error("AI response does not contain valid slide data.");
      }
    } catch (error) {
      console.error("Error sending prompt to API:", error);
      setAiResponse(null); // Set to null if there's an error, as the structure is different
      setPptxBlobUrl(null); // Clear PPTX preview on error
      setMessages((prev) => prev.filter((m) => m.role !== 'thinking'))
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onLoadHistory={async ({ prompt, slides, messages: loadedMessages, id }) => {
          // Ensure we have messages to show the chat interface
          const messagesToSet = loadedMessages && loadedMessages.length > 0 
            ? loadedMessages 
            : [
                { role: 'user' as const, content: prompt, createdAt: new Date().toISOString() },
                { role: 'assistant' as const, content: `Loaded ${slides.length} slides from history`, createdAt: new Date().toISOString() }
              ]
          
          setMessages(messagesToSet)
          setAiResponse(slides)
          setSessionId(id || null)
          setLoading(true)
          
          try {
            if (pptxBlobUrl) {
              URL.revokeObjectURL(pptxBlobUrl)
              setPptxBlobUrl(null)
            }
            const generatedBlob = await generatePpt(slides, "AI_Generated_Presentation")
            const blobUrl = URL.createObjectURL(generatedBlob as Blob)
            setPptxBlobUrl(blobUrl)
          } catch (e) {
            console.error('Failed to load history item', e)
          } finally {
            setLoading(false)
          }
        }}
      />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">AI Slides</h1>
            {aiResponse && aiResponse.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode('preview')}
                  variant={viewMode === 'preview' ? 'default' : 'outline'}
                  size="sm"
                >
                  Preview
                </Button>
                <Button
                  onClick={() => setViewMode('editor')}
                  variant={viewMode === 'editor' ? 'default' : 'outline'}
                  size="sm"
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex p-4 gap-4">
          {messages.length > 0 ? (
            <>
              <div className="w-1/3 flex flex-col">
                <div className="flex-1 overflow-auto space-y-3 pr-1">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'self-end bg-primary text-primary-foreground ml-auto' : m.role === 'assistant' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'}`}>
                      {m.content}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <SearchBar onSend={handleSearchSend} />
                </div>
              </div>
              {aiResponse && aiResponse.length > 0 && (
                <div className="flex-1">
                  {viewMode === 'preview' ? (
                    <PptxPreview pptxBlobUrl={pptxBlobUrl} slides={aiResponse} />
                  ) : (
                    <PptEditor 
                      initialSlides={aiResponse}
                      onSlidesChange={(updatedSlides) => {
                        setAiResponse(updatedSlides);
                      }}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-xl">
                <SearchBar onSend={handleSearchSend} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

