"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
} from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/components/ui/button";

interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  skipSeconds?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  hasPreviousLesson?: boolean;
  hasNextLesson?: boolean;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  className,
  skipSeconds = 5,
  onNext,
  onPrevious,
  hasPreviousLesson = false,
  hasNextLesson = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  // console.log("durationreal", duration)
  // console.log("duration", videoRef.current?.duration)

  useEffect(() => {
    if (videoRef.current && src) {
      videoRef.current.src = src;
      videoRef.current.load(); // reload new video
      setIsPlaying(false);
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const timeUpdateHandler = () => setCurrentTime(video.currentTime);
    const loadedMetadataHandler = () => setDuration(video.duration);
    const endedHandler = () => {
      // when video ends, call onNext() if available
      if (onNext && !hasNextLesson) onNext();
    };

    video.addEventListener("timeupdate", timeUpdateHandler);
    video.addEventListener("loadedmetadata", loadedMetadataHandler);
    video.addEventListener("ended", endedHandler);

    return () => {
      video.removeEventListener("timeupdate", timeUpdateHandler);
      video.removeEventListener("loadedmetadata", loadedMetadataHandler);
      video.removeEventListener("ended", endedHandler);
    };
  }, [onNext, hasNextLesson]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (video && duration > 0) {
      const newTime = Math.min(video.currentTime + skipSeconds, duration);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration, skipSeconds]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (video && duration > 0) {
      const newTime = Math.max(video.currentTime - skipSeconds, 0);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration, skipSeconds]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // 3 seconds of inactivity
  };

  useEffect(() => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    const handleMouseMove = () => resetHideTimer();

    videoContainer.addEventListener("mousemove", handleMouseMove);
    resetHideTimer(); // start timer on mount

    return () => {
      videoContainer.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        skipForward();
      } else if (e.key === "ArrowLeft") {
        skipBackward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, skipForward, skipBackward]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (onNext) onNext();
  };

  const preVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (onPrevious) onPrevious();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg overflow-hidden",
        className
      )}
    >
      <video
        ref={videoRef}
        preload="metadata"
        className="w-full h-full object-contain"
        // onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* TITLE */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-white font-semibold text-lg">
          {title}
        </div>
      )}

      {/* Controls */}
      {!isLoading ? (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500",
            showControls ? "opacity-100 visible" : "opacity-0 invisible"
          )}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={resetHideTimer}
        >
          {/* {title && <div className="text-white font-semibold mb-1">{title}</div>} */}

          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            step="0.1"
            onChange={handleSeek}
            onInput={handleSeek}
            className="w-full h-1.5 accent-primary cursor-pointer"
          />

          <div className="flex items-center justify-between text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <div className="flex justify-center gap-4 mt-2">
              {onPrevious && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={duration === 0 || hasPreviousLesson}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                  onClick={preVideo}
                >
                  <SkipBack className="h-6 w-6" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              {onNext && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={hasNextLesson}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                  onClick={nextVideo}
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>{formatTime(duration)}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute left-0 top-0 w-full h-full flex justify-center items-center z-10">
          <span className="w-16 h-16 rounded-full border-2 border-white border-r-transparent border-l-transparent animate-spin duration-[10s]"></span>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
