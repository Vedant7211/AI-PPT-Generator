'use client'

import { useEffect, useState } from "react";
import { Home, Search, Settings, FileText, BarChart2, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onLoadHistory?: (payload: { id: string; prompt: string; slides: Array<{ title: string; content: string[] }>; messages: Array<{ role: 'user' | 'assistant' | 'thinking'; content: string; createdAt: string }> }) => void;
}

export function Sidebar({ isOpen, toggleSidebar, onLoadHistory }: SidebarProps) {
  const [history, setHistory] = useState<Array<{ id: string; prompt: string; slides: Array<{ title: string; content: string[] }>; messages: Array<{ role: 'user' | 'assistant' | 'thinking'; content: string; createdAt: string }>; createdAt: string }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/history')
        if (!res.ok) return
        const data = await res.json()
        const items = (data.items || []).map((i: any) => ({ id: i.id, prompt: i.prompt, slides: i.slides, messages: i.messages || [], createdAt: i.createdAt }))
        setHistory(items)
      } catch {}
    }
    load()
  }, [])

  return (
    <div className={`flex flex-col h-full bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'} p-4`}>
      <div className="flex justify-between items-center mb-6">
        {isOpen && <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Slides</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Button variant="ghost" className="w-full justify-start flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Home className="h-5 w-5" />
              {isOpen && <span>Home</span>}
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Search className="h-5 w-5" />
              {isOpen && <span>Search</span>}
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <FileText className="h-5 w-5" />
              {isOpen && <span>My Slides</span>}
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <BarChart2 className="h-5 w-5" />
              {isOpen && <span>Analytics</span>}
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Users className="h-5 w-5" />
              {isOpen && <span>Team</span>}
            </Button>
          </li>
        </ul>
        {isOpen && (
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">History</h3>
            <div className="space-y-2 max-h-[40vh] overflow-auto pr-1">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => onLoadHistory && onLoadHistory({ id: h.id, prompt: h.prompt, slides: h.slides, messages: h.messages })}
                  className="w-full text-left p-2 rounded bg-white/60 hover:bg-white dark:bg-gray-700/40 dark:hover:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 transition"
                >
                  <div className="line-clamp-2">{h.prompt}</div>
                  <div className="text-[10px] mt-1 text-gray-400">{new Date(h.createdAt).toLocaleString()}</div>
                </button>
              ))}
              {history.length === 0 && (
                <div className="text-xs text-gray-500">No history yet</div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
          <Settings className="h-5 w-5" />
          {isOpen && <span>Settings</span>}
        </Button>
      </div>
    </div>
  );
}
