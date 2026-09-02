'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Mic2,
  Sliders,
  Volume1,
  Disc,
  ListMusic,
} from 'lucide-react';
import { SongMetadata } from '@/types';
import { formatTimeSeconds } from '@/lib/utils/formatters';
import { AudioVisualizer } from './AudioVisualizer';
import { audioManager } from '@/lib/audio/audio-context';
import { synthMusicPlayer } from '@/lib/audio/synth-music';

interface MusicPlayerDockProps {
  currentSong: SongMetadata;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onCycleRepeat: () => void;
  isLyricsOpen: boolean;
  onToggleLyrics: () => void;
  isSoundboardOpen: boolean;
  onToggleSoundboard: () => void;
  isMediaSelectorOpen: boolean;
  onToggleMediaSelector: () => void;
  activeAmbientCount: number;
  accentColor?: string;
}

export const MusicPlayerDock: React.FC<MusicPlayerDockProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNextSong,
  onPrevSong,
  currentTime,
  duration,
  onSeek,
  volume,
  onChangeVolume,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  isLyricsOpen,
  onToggleLyrics,
  isSoundboardOpen,
  onToggleSoundboard,
  isMediaSelectorOpen,
  onToggleMediaSelector,
  activeAmbientCount,
  accentColor = '#6366f1',
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMuteToggle = () => {
    if (isMuted) {
      onChangeVolume(prevVolume || 0.7);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onChangeVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none select-none">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-3xl bg-white/[0.06] p-3 sm:p-4 backdrop-blur-3xl border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition hover:border-white/25">
        {/* Top Mini Scrubber Bar */}
        <div className="group relative mb-3 flex items-center gap-3">
          <span className="font-mono text-[11px] text-white/50 w-10 text-right">
            {formatTimeSeconds(currentTime)}
          </span>

          <div className="relative flex-1 h-1.5 flex items-center">
            {/* Progress Background */}
            <div className="h-full w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}`,
                }}
              />
            </div>

            {/* Slider Input */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="font-mono text-[11px] text-white/50 w-10">
            {formatTimeSeconds(duration)}
          </span>
        </div>

        {/* Player Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Track Details & Cover */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-xs">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30 overflow-hidden shadow-md">
              {currentSong.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSong.cover}
                  alt={currentSong.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Disc
                  className={`h-6 w-6 text-indigo-300 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-semibold text-white text-xs sm:text-sm">
                  {currentSong.title}
                </h4>
              </div>
              <p className="truncate text-[11px] text-white/50">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Center: Playback Buttons & Visualizer */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shuffle */}
              <button
                onClick={onToggleShuffle}
                className={`p-2 transition rounded-full ${
                  isShuffle
                    ? 'text-indigo-400 bg-indigo-500/15'
                    : 'text-white/40 hover:text-white'
                }`}
                title="Shuffle Playlist"
              >
                <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              {/* Prev */}
              <button
                onClick={onPrevSong}
                className="p-2 text-white/70 hover:text-white transition rounded-full"
                title="Previous Track (ArrowLeft)"
              >
                <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Play / Pause Main Button */}
              <button
                onClick={onTogglePlay}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.4)] transition hover:scale-105 active:scale-95"
                title="Play / Pause (Space)"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={onNextSong}
                className="p-2 text-white/70 hover:text-white transition rounded-full"
                title="Next Track (ArrowRight)"
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Repeat */}
              <button
                onClick={onCycleRepeat}
                className={`p-2 transition rounded-full ${
                  repeatMode !== 'off'
                    ? 'text-indigo-400 bg-indigo-500/15'
                    : 'text-white/40 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Audio Visualizer, Volume & Utility Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
            {/* Visualizer canvas */}
            <div className="hidden lg:flex items-center px-2">
              <AudioVisualizer isPlaying={isPlaying} accentColor={accentColor} />
            </div>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="text-white/60 hover:text-white transition"
              >
                {volume === 0 || isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  onChangeVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Synchronized Lyrics Toggle */}
            <button
              onClick={onToggleLyrics}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                isLyricsOpen
                  ? 'bg-indigo-600/40 text-white border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Synchronized Lyrics (L)"
            >
              <Mic2 className="h-4 w-4" />
            </button>

            {/* Ambient Soundboard Toggle with Badge */}
            <button
              onClick={onToggleSoundboard}
              className={`relative flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                isSoundboardOpen
                  ? 'bg-indigo-600/40 text-white border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Ambient Sound Mixer"
            >
              <Volume2 className="h-4 w-4" />
              {activeAmbientCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black shadow-md">
                  {activeAmbientCount}
                </span>
              )}
            </button>

            {/* Media Studio Toggle */}
            <button
              onClick={onToggleMediaSelector}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                isMediaSelectorOpen
                  ? 'bg-indigo-600/40 text-white border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Media Studio"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
