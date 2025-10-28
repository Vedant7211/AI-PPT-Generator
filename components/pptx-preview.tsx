"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  title: string;
  content: string[];
}

interface PptxPreviewProps {
  pptxBlobUrl: string | null;
  slides: Slide[] | null;
}

export function PptxPreview({ pptxBlobUrl, slides }: PptxPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset to first slide when new slides are generated
  useEffect(() => {
    if (slides && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!slides || slides.length === 0) return;

      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [slides]);

  const handleDownload = () => {
    if (!pptxBlobUrl) return;

    const link = document.createElement("a");
    link.href = pptxBlobUrl;
    link.download = "presentation.pptx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToPrevious = () => {
    if (slides) {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    }
  };

  const goToNext = () => {
    if (slides) {
      setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Live Preview
        </h2>
        <div className="flex items-center justify-center min-h-[500px] text-gray-500 dark:text-gray-400">
          <p>Your presentation will appear here after generation.</p>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Live Preview
        </h2>
        <Button
          onClick={handleDownload}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PPTX
        </Button>
      </div>

      {/* Slide Navigation */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          onClick={goToPrevious}
          disabled={currentSlide === 0}
          size="icon"
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <Button
          onClick={goToNext}
          disabled={currentSlide === slides.length - 1}
          size="icon"
          variant="outline"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`min-w-[80px] h-[60px] rounded border-2 transition-all ${
              index === currentSlide
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            } bg-white dark:bg-gray-900 text-xs font-medium`}
          >
            {index === currentSlide ? "✓" : index + 1}
          </button>
        ))}
      </div>

      {/* Current Slide Display - Matches PPTX Structure */}
      <div className="relative rounded-lg shadow-lg min-h-[500px] overflow-hidden">
        {currentSlide === 0 ? (
          // Title Slide - Blue Background (matches TITLE_SLIDE master)
          <div
            className="p-8 min-h-[500px] flex flex-col justify-center relative"
            style={{ backgroundColor: "#4472C4" }}
          >
            <div className="space-y-6 z-10">
              <h3 className="text-5xl font-bold text-white leading-tight">
                {currentSlideData.title}
              </h3>
              {currentSlideData.content.length > 0 && (
                <p className="text-3xl text-white leading-relaxed">
                  {currentSlideData.content[0]}
                </p>
              )}
            </div>
            {/* Decorative line matching PPTX */}
            <div className="absolute bottom-1/4 left-0 w-full h-1 bg-white opacity-30" />
          </div>
        ) : (
          // Content Slide - White Background with Blue Accent (matches CONTENT_SLIDE master)
          <div className="relative bg-white dark:bg-gray-800 min-h-[500px]">
            {/* Left blue accent bar - matches PPTX CONTENT_SLIDE master */}

            {/* Decorative line */}
            {/* <div 
              className="absolute top-1/2 left-0 w-full h-0.5"
              style={{ backgroundColor: '#4472C4', height: '2px' }}
            /> */}

            <div className="p-8 pl-[25%] flex flex-col justify-center min-h-[500px]">
              <div className="space-y-6">
                {/* Title */}
                <h3
                  className="text-3xl font-bold leading-tight dark:text-blue-500"
                  style={{ color: "#4472C4" }}
                >
                  {currentSlideData.title}
                </h3>

                {/* Bullet points */}
                <ul className="space-y-3">
                  {currentSlideData.content.map((point, pointIndex) => (
                    <li
                      key={pointIndex}
                      className="flex items-start gap-3 text-lg leading-relaxed dark:text-gray-200"
                      style={{ color: "#363636" }}
                    >
                      <span className="text-blue-500 font-bold mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
