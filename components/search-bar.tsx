'use client'

import { Input } from "./ui/input";
import { Paperclip, Send } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface SearchBarProps {
  onSend: (prompt: string) => void;
}

export function SearchBar({ onSend }: SearchBarProps) {
  const [prompt, setPrompt] = useState("");

  const handleSendClick = () => {
    if (prompt.trim()) {
      onSend(prompt);
      setPrompt("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendClick();
    }
  };

  return (
    <div className="relative w-full max-w-4xl h-40 flex flex-col justify-between bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <Input
        type="text"
        placeholder="Start with a topic, we'll turn it into slides!"
        className="flex-1 w-full h-full p-2 border-none focus:ring-0 text-lg bg-transparent resize-none"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <div className="flex justify-between items-center mt-auto pt-2 ">
        <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg p-2" onClick={handleSendClick}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
