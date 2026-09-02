'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VideoMetadata } from '@/types';

interface VideoBackgroundProps {
  activeVideo: VideoMetadata;
  enabled: boolean;
  opacity: number;
  blur: number;
  bgGradient?: string;
  theme?: string;
  isPlaying?: boolean;
  currentTime?: number;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  activeVideo,
  enabled,
  opacity = 0.85,
  blur = 0,
  bgGradient,
  theme,
  isPlaying = false,
  currentTime = 0,
}) => {
  const [currentSrc, setCurrentSrc] = useState(activeVideo.videoSrc);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const nextVideoRef = useRef<HTMLVideoElement | null>(null);

  // Crossfade handling when activeVideo changes
  useEffect(() => {
    if (activeVideo.videoSrc !== currentSrc) {
      setNextSrc(activeVideo.videoSrc);
      setIsCrossfading(true);
      const timer = setTimeout(() => {
        setCurrentSrc(activeVideo.videoSrc);
        setNextSrc(null);
        setIsCrossfading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeVideo.videoSrc, currentSrc]);

  // Mobile video unlock & initialization
  useEffect(() => {
    const video = currentVideoRef.current;
    if (!video) return;

    // Strict requirements for mobile iOS / Android inline playback
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');

    // First attempt to load and play
    video.load();
    if (isPlaying && enabled) {
      video.play().catch(() => {});
    }

    // Touch listener to unlock mobile autoplay policy on first user tap
    const handleFirstTouch = () => {
      if (video && enabled) {
        if (isPlaying) {
          video.play().catch(() => {});
        }
      }
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };

    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('click', handleFirstTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, [currentSrc]);

  // Synchronize Play / Pause with music player
  useEffect(() => {
    const video = currentVideoRef.current;
    if (!video) return;

    if (isPlaying && enabled) {
      video.muted = true;
      if (typeof currentTime === 'number' && video.duration && !isNaN(video.duration)) {
        const target = currentTime % video.duration;
        if (Math.abs(video.currentTime - target) > 0.5) {
          video.currentTime = target;
        }
      }
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, enabled, currentSrc, currentTime]);

  // Sync video time when seeking
  useEffect(() => {
    const video = currentVideoRef.current;
    if (!video) return;

    if (enabled && typeof currentTime === 'number' && video.duration && !isNaN(video.duration)) {
      const target = currentTime % video.duration;
      if (Math.abs(video.currentTime - target) > 0.5) {
        video.currentTime = target;
      }
    }
  }, [currentTime, enabled]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.muted = true;
    video.defaultMuted = true;
    if (typeof currentTime === 'number' && video.duration && !isNaN(video.duration)) {
      video.currentTime = currentTime % video.duration;
    }
    if (isPlaying && enabled) {
      video.play().catch(() => {});
    }
  };

  // Thematic CSS fallback base
  const getThemeFallbackClass = () => {
    const t = theme || activeVideo.backdropTheme || 'night_city';
    switch (t) {
      case 'rain':
        return 'bg-gradient-to-b from-[#06101e] via-[#091e36] to-[#040812]';
      case 'sunset':
        return 'bg-gradient-to-b from-[#2e1065] via-[#7c2d12] via-[#b45309] to-[#0f0a1c]';
      case 'night_city':
        return 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#05060b]';
      case 'forest':
        return 'bg-gradient-to-b from-[#064e3b] via-[#062e24] to-[#021510]';
      case 'aurora':
        return 'bg-gradient-to-b from-[#042f2e] via-[#0f172a] via-[#311042] to-[#020617]';
      case 'ocean':
        return 'bg-gradient-to-b from-[#082f49] via-[#0369a1] to-[#021422]';
      case 'thunder':
        return 'bg-gradient-to-b from-[#1e1b4b] via-[#3b0764] to-[#08020f]';
      case 'snow':
        return 'bg-gradient-to-b from-[#1e293b] via-[#334155] to-[#090d16]';
      default:
        return 'bg-gradient-to-b from-[#0b0f19] via-[#111827] to-[#030712]';
    }
  };

  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-black select-none pointer-events-none">
      {/* Dynamic atmospheric theme base */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${getThemeFallbackClass()}`}
        style={{
          background: bgGradient || undefined,
        }}
      />

      {/* Video layer */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: enabled ? opacity : 0,
          visibility: enabled && opacity > 0 ? 'visible' : 'hidden',
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          transform: blur > 0 ? 'scale(1.05)' : 'none',
        }}
      >
        {/* Active Video Element with direct src and full mobile playsInline support */}
        <video
          ref={currentVideoRef}
          key={currentSrc}
          src={currentSrc}
          autoPlay={isPlaying}
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            isCrossfading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Next Video Crossfade Element */}
        {nextSrc && (
          <video
            ref={nextVideoRef}
            key={nextSrc}
            src={nextSrc}
            autoPlay={isPlaying}
            loop
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={handleLoadedMetadata}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              isCrossfading ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Atmospheric Vignette & Color Grade Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060b]/90 via-[#05060b]/40 to-[#05060b]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(5,6,11,0.75)_100%)] pointer-events-none" />
    </div>
  );
};
