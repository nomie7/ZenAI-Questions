"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Download,
    RotateCcw,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
    imageUrl: string;
    alt: string;
    docName?: string;
    pageNumber?: string | number;
    className?: string;
    showControls?: boolean;
    enableZoom?: boolean;
    enableDownload?: boolean;
}

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const DEFAULT_ZOOM_INDEX = 3; // 100%

export function ImageViewer({
    imageUrl,
    alt,
    docName = "Document",
    pageNumber = "1",
    className,
    showControls = true,
    enableZoom = true,
    enableDownload = true,
}: ImageViewerProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const currentZoom = ZOOM_LEVELS[zoomIndex];
    const isZoomed = currentZoom > 1;

    // Debug: Log image URL when component mounts or URL changes
    useEffect(() => {
        console.log('ImageViewer - Image URL:', imageUrl);
        console.log('ImageViewer - Doc:', docName, 'Page:', pageNumber);
    }, [imageUrl, docName, pageNumber]);

    // Reset position when zoom changes
    useEffect(() => {
        if (!isZoomed) {
            setPosition({ x: 0, y: 0 });
        }
    }, [isZoomed]);

    const handleZoomIn = () => {
        if (zoomIndex < ZOOM_LEVELS.length - 1) {
            setZoomIndex(zoomIndex + 1);
        }
    };

    const handleZoomOut = () => {
        if (zoomIndex > 0) {
            setZoomIndex(zoomIndex - 1);
        }
    };

    const handleReset = () => {
        setZoomIndex(DEFAULT_ZOOM_INDEX);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isZoomed) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !isZoomed) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!enableZoom) return;

        // Only zoom if Ctrl/Cmd is held or if naturally zoomed
        if (e.ctrlKey || e.metaKey || isZoomed) {
            e.preventDefault();
            if (e.deltaY < 0) {
                handleZoomIn();
            } else {
                handleZoomOut();
            }
        }
    };

    const handleDoubleClick = () => {
        if (!enableZoom) return;
        if (zoomIndex === DEFAULT_ZOOM_INDEX) {
            setZoomIndex(DEFAULT_ZOOM_INDEX + 2); // Jump to 150%
        } else {
            handleReset();
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Generate filename
            const extension = imageUrl.split(".").pop()?.split("?")[0] || "png";
            link.download = `${docName.replace(/[^a-z0-9]/gi, "_")}_page_${pageNumber}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download image:", error);
        }
    };

    if (!imageUrl) {
        return (
            <div className={cn("w-full aspect-[8.5/11] flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg", className)}>
                <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No image available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full", className)}>
            {/* Controls */}
            {showControls && imageLoaded && !imageError && (
                <div className="flex items-center justify-center gap-1 mb-3 p-2 bg-gray-100 rounded-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={zoomIndex === 0 || !enableZoom}
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>

                    <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center">
                        {Math.round(currentZoom * 100)}%
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={zoomIndex === ZOOM_LEVELS.length - 1 || !enableZoom}
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        disabled={zoomIndex === DEFAULT_ZOOM_INDEX && position.x === 0 && position.y === 0}
                        title="Reset view"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    {enableDownload && (
                        <>
                            <div className="w-px h-6 bg-gray-300 mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                title="Download image"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* Image Container */}
            <div
                ref={containerRef}
                className={cn(
                    "relative bg-gray-100 rounded-lg overflow-hidden border",
                    isZoomed && "cursor-move",
                    !isZoomed && "cursor-default"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
            >
                {/* Loading skeleton */}
                {!imageLoaded && !imageError && (
                    <Skeleton className="w-full aspect-[8.5/11]" />
                )}

                {/* Error state */}
                {imageError && (
                    <div className="w-full aspect-[8.5/11] flex items-center justify-center bg-gray-100 text-gray-400">
                        <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Page image unavailable</p>
                        </div>
                    </div>
                )}

                {/* Actual image */}
                {!imageError && (
                    <div className="overflow-hidden w-full">
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt={alt}
                            className={cn(
                                "w-full object-contain transition-transform select-none",
                                !imageLoaded && "hidden"
                            )}
                            style={{
                                transform: `scale(${currentZoom}) translate(${position.x / currentZoom}px, ${position.y / currentZoom}px)`,
                                transformOrigin: "center center",
                            }}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                console.error('Image failed to load:', imageUrl);
                                console.error('Error event:', e);
                                setImageError(true);
                            }}
                            draggable={false}
                        />
                    </div>
                )}
            </div>

            {/* Help text */}
            {showControls && imageLoaded && !imageError && enableZoom && (
                <p className="text-xs text-gray-500 text-center mt-2">
                    💡 Scroll to zoom, drag to pan, double-click to toggle zoom
                </p>
            )}
        </div>
    );
}
