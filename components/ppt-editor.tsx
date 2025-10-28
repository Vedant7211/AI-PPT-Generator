"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  X,
  Palette,
  Plus,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import { generatePpt } from "../lib/pptGenerator";

interface Slide {
  title: string;
  content: string[];
}

interface SlideStyle {
  backgroundColor: string;
  titleColor: string;
  contentColor: string;
  titleFontSize: number;
  contentFontSize: number;
  titleFontFamily: string;
  contentFontFamily: string;
  accentColor: string;
}

interface PptEditorProps {
  initialSlides: Slide[];
  onSlidesChange?: (slides: Slide[]) => void;
  onStyleChange?: (styles: SlideStyle[]) => void;
}

const defaultStyle: SlideStyle = {
  backgroundColor: "#FFFFFF",
  titleColor: "#4472C4",
  contentColor: "#363636",
  titleFontSize: 32,
  contentFontSize: 18,
  titleFontFamily: "Arial",
  contentFontFamily: "Arial",
  accentColor: "#4472C4",
};

const titleSlideStyle: SlideStyle = {
  backgroundColor: "#4472C4",
  titleColor: "#FFFFFF",
  contentColor: "#FFFFFF",
  titleFontSize: 48,
  contentFontSize: 28,
  titleFontFamily: "Arial",
  contentFontFamily: "Arial",
  accentColor: "#FFFFFF",
};

const fontOptions = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Courier New",
];

const colorPresets = [
  "#4472C4",
  "#E74C3C",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#34495E",
  "#E67E22",
  "#3498DB",
  "#95A5A6",
];

export function PptEditor({
  initialSlides,
  onSlidesChange,
  onStyleChange,
}: PptEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [slideStyles, setSlideStyles] = useState<SlideStyle[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [pptxBlobUrl, setPptxBlobUrl] = useState<string | null>(null);

  // Initialize slide styles
  useEffect(() => {
    const styles = slides.map((_, index) =>
      index === 0 ? { ...titleSlideStyle } : { ...defaultStyle }
    );
    setSlideStyles(styles);
  }, [slides.length]);

  // Update parent when slides change
  useEffect(() => {
    onSlidesChange?.(slides);
  }, [slides, onSlidesChange]);

  // Update parent when styles change
  useEffect(() => {
    onStyleChange?.(slideStyles);
  }, [slideStyles, onStyleChange]);

  // Generate PPTX when slides or styles change
  useEffect(() => {
    const generatePreview = async () => {
      try {
        if (pptxBlobUrl) {
          URL.revokeObjectURL(pptxBlobUrl);
        }
        const blob = await generatePpt(slides, "Edited_Presentation");
        const blobUrl = URL.createObjectURL(blob as Blob);
        setPptxBlobUrl(blobUrl);
      } catch (error) {
        console.error("Failed to generate PPTX preview:", error);
      }
    };

    if (slides.length > 0) {
      generatePreview();
    }

    return () => {
      if (pptxBlobUrl) {
        URL.revokeObjectURL(pptxBlobUrl);
      }
    };
  }, [slides, slideStyles]);

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide({ ...slide });
    setIsEditing(true);
  };

  const handleSaveSlide = () => {
    if (editingSlide) {
      const updatedSlides = [...slides];
      updatedSlides[currentSlide] = editingSlide;
      setSlides(updatedSlides);
      setIsEditing(false);
      setEditingSlide(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSlide(null);
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      title: "New Slide",
      content: ["Add your content here"],
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const handleDuplicateSlide = () => {
    const slideToClone = slides[currentSlide];
    const clonedSlide: Slide = {
      title: `${slideToClone.title} (Copy)`,
      content: [...slideToClone.content],
    };
    const updatedSlides = [...slides];
    updatedSlides.splice(currentSlide + 1, 0, clonedSlide);
    setSlides(updatedSlides);
    setCurrentSlide(currentSlide + 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length > 1) {
      const updatedSlides = slides.filter((_, index) => index !== currentSlide);
      setSlides(updatedSlides);
      setCurrentSlide(Math.max(0, currentSlide - 1));
    }
  };

  const handleStyleChange = (
    property: keyof SlideStyle,
    value: string | number
  ) => {
    const updatedStyles = [...slideStyles];
    updatedStyles[currentSlide] = {
      ...updatedStyles[currentSlide],
      [property]: value,
    };
    setSlideStyles(updatedStyles);
  };

  const handleAddContentPoint = () => {
    if (editingSlide) {
      setEditingSlide({
        ...editingSlide,
        content: [...editingSlide.content, "New point"],
      });
    }
  };

  const handleRemoveContentPoint = (index: number) => {
    if (editingSlide) {
      setEditingSlide({
        ...editingSlide,
        content: editingSlide.content.filter((_, i) => i !== index),
      });
    }
  };

  const handleDownload = () => {
    if (!pptxBlobUrl) return;

    const link = document.createElement("a");
    link.href = pptxBlobUrl;
    link.download = "edited_presentation.pptx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentSlideData = slides[currentSlide];
  const currentStyle = slideStyles[currentSlide] || defaultStyle;

  if (!slides || slides.length === 0) {
    return (
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-center min-h-[500px] text-gray-500 dark:text-gray-400">
          <p>No slides to edit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          PPT Editor
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => handleEditSlide(currentSlideData)}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Button>
          <Button
            onClick={() => setShowStylePanel(!showStylePanel)}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Style
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Main Editor Area */}
        <div className="flex-1">
          {/* Slide Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
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
                onClick={() =>
                  setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
                }
                disabled={currentSlide === slides.length - 1}
                size="icon"
                variant="outline"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddSlide} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleDuplicateSlide}
                size="sm"
                variant="outline"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleDeleteSlide}
                size="sm"
                variant="outline"
                disabled={slides.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Slide Preview */}
          <div className="relative rounded-lg shadow-lg min-h-[500px] overflow-hidden mb-4">
            {currentSlide === 0 ? (
              // Title Slide
              <div
                className="p-8 min-h-[500px] flex flex-col justify-center relative"
                style={{ backgroundColor: currentStyle.backgroundColor }}
              >
                <div className="space-y-6 z-10">
                  <h3
                    className="text-5xl font-bold leading-tight"
                    style={{
                      color: currentStyle.titleColor,
                      fontSize: `${currentStyle.titleFontSize}px`,
                      fontFamily: currentStyle.titleFontFamily,
                    }}
                  >
                    {currentSlideData.title}
                  </h3>
                  {currentSlideData.content.length > 0 && (
                    <p
                      className="text-3xl leading-relaxed"
                      style={{
                        color: currentStyle.contentColor,
                        fontSize: `${currentStyle.contentFontSize}px`,
                        fontFamily: currentStyle.contentFontFamily,
                      }}
                    >
                      {currentSlideData.content[0]}
                    </p>
                  )}
                </div>
                <div
                  className="absolute bottom-1/4 left-0 w-full h-1 opacity-30"
                  style={{ backgroundColor: currentStyle.accentColor }}
                />
              </div>
            ) : (
              // Content Slide
              <div
                className="relative min-h-[500px] flex"
                style={{ backgroundColor: currentStyle.backgroundColor }}
              >
                {/* Left accent panel */}
                <div
                  className="w-1/4 min-h-full relative"
                  style={{ backgroundColor: currentStyle.accentColor }}
                >
                  {/* Horizontal accent line */}
                  <div
                    className="absolute top-1/2 left-0 w-full h-0.5 transform -translate-y-1/2"
                    style={{
                      backgroundColor: currentStyle.backgroundColor,
                      opacity: 0.3,
                    }}
                  />
                </div>

                {/* Content area */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <div className="space-y-6">
                    <h3
                      className="font-bold leading-tight"
                      style={{
                        color: currentStyle.titleColor,
                        fontSize: `${currentStyle.titleFontSize}px`,
                        fontFamily: currentStyle.titleFontFamily,
                      }}
                    >
                      {currentSlideData.title}
                    </h3>

                    <ul className="space-y-3">
                      {currentSlideData.content.map((point, pointIndex) => (
                        <li
                          key={pointIndex}
                          className="flex items-start gap-3 leading-relaxed"
                          style={{
                            color: currentStyle.contentColor,
                            fontSize: `${currentStyle.contentFontSize}px`,
                            fontFamily: currentStyle.contentFontFamily,
                          }}
                        >
                          <span
                            style={{ color: currentStyle.accentColor }}
                            className="font-bold mt-1"
                          >
                            •
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slide Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`min-w-[120px] h-[80px] rounded border-2 transition-all p-2 text-xs ${
                  index === currentSlide
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } bg-white dark:bg-gray-900`}
              >
                <div className="truncate font-medium">{slide.title}</div>
                <div className="text-gray-500 mt-1">Slide {index + 1}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Style Panel */}
        {showStylePanel && (
          <div className="w-80 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Style Options</h3>
              <Button
                onClick={() => setShowStylePanel(false)}
                size="icon"
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Colors */}
              <div>
                <Label className="text-sm font-medium">Background Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        handleStyleChange("backgroundColor", color)
                      }
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={currentStyle.backgroundColor}
                  onChange={(e) =>
                    handleStyleChange("backgroundColor", e.target.value)
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Title Color</Label>
                <Input
                  type="color"
                  value={currentStyle.titleColor}
                  onChange={(e) =>
                    handleStyleChange("titleColor", e.target.value)
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Content Color</Label>
                <Input
                  type="color"
                  value={currentStyle.contentColor}
                  onChange={(e) =>
                    handleStyleChange("contentColor", e.target.value)
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Accent Color</Label>
                <Input
                  type="color"
                  value={currentStyle.accentColor}
                  onChange={(e) =>
                    handleStyleChange("accentColor", e.target.value)
                  }
                  className="mt-2"
                />
              </div>

              {/* Fonts */}
              <div>
                <Label className="text-sm font-medium">Title Font</Label>
                <select
                  value={currentStyle.titleFontFamily}
                  onChange={(e) =>
                    handleStyleChange("titleFontFamily", e.target.value)
                  }
                  className="w-full mt-2 p-2 border rounded"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Content Font</Label>
                <select
                  value={currentStyle.contentFontFamily}
                  onChange={(e) =>
                    handleStyleChange("contentFontFamily", e.target.value)
                  }
                  className="w-full mt-2 p-2 border rounded"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Sizes */}
              <div>
                <Label className="text-sm font-medium">
                  Title Size: {currentStyle.titleFontSize}px
                </Label>
                <input
                  type="range"
                  min="20"
                  max="72"
                  value={currentStyle.titleFontSize}
                  onChange={(e) =>
                    handleStyleChange("titleFontSize", parseInt(e.target.value))
                  }
                  className="w-full mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Content Size: {currentStyle.contentFontSize}px
                </Label>
                <input
                  type="range"
                  min="12"
                  max="36"
                  value={currentStyle.contentFontSize}
                  onChange={(e) =>
                    handleStyleChange(
                      "contentFontSize",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full mt-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Slide</h3>
              <Button onClick={handleCancelEdit} size="icon" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingSlide.title}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, title: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Content Points</Label>
                <div className="space-y-2 mt-2">
                  {editingSlide.content.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={point}
                        onChange={(e) => {
                          const newContent = [...editingSlide.content];
                          newContent[index] = e.target.value;
                          setEditingSlide({
                            ...editingSlide,
                            content: newContent,
                          });
                        }}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        onClick={() => handleRemoveContentPoint(index)}
                        size="icon"
                        variant="outline"
                        disabled={editingSlide.content.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleAddContentPoint}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Point
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={handleCancelEdit} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSaveSlide}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
