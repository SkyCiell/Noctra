'use client';

import React, { useState } from 'react';
import {
  X,
  Video,
  Music,
  Heart,
  Eye,
  EyeOff,
  Sliders,
  Play,
  Pause,
  Sparkles,
  Check,
  Disc,
} from 'lucide-react';
import { SongMetadata, VideoMetadata } from '@/types';
import { MUSIC_REGISTRY, VIDEO_REGISTRY } from '@/lib/media/registry';
import { formatTimeSeconds } from '@/lib/utils/formatters';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVideo: VideoMetadata;
  onSelectVideo: (video: VideoMetadata) => void;
  activeSong: SongMetadata;
  onSelectSong: (song: SongMetadata) => void;
  isPlayingMusic: boolean;
  onTogglePlayMusic: () => void;
  videoEnabled: boolean;
  onToggleVideoEnabled: () => void;
  videoOpacity: number;
  onChangeVideoOpacity: (val: number) => void;
  videoBlur: number;
  onChangeVideoBlur: (val: number) => void;
  favoriteSongIds: string[];
  onToggleFavoriteSong: (id: string) => void;
  favoriteVideoIds: string[];
  onToggleFavoriteVideo: (id: string) => void;
  accentColor?: string;
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({
  isOpen,
  onClose,
  activeVideo,
  onSelectVideo,
  activeSong,
  onSelectSong,
  isPlayingMusic,
  onTogglePlayMusic,
  videoEnabled,
  onToggleVideoEnabled,
  videoOpacity,
  onChangeVideoOpacity,
  videoBlur,
  onChangeVideoBlur,
  favoriteSongIds,
  onToggleFavoriteSong,
  favoriteVideoIds,
  onToggleFavoriteVideo,
  accentColor = '#6366f1',
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'music'>('video');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#060812]/85 backdrop-blur-2xl"
      />

      {/* Main Container */}
      <div className="relative z-10 flex h-[85vh] w-full max-w-3xl flex-col rounded-3xl bg-white/[0.04] p-6 backdrop-blur-3xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === 'video'
                  ? 'bg-indigo-600/40 text-white border border-indigo-400/50 shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Background Visuals</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === 'music'
                  ? 'bg-indigo-600/40 text-white border border-indigo-400/50 shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Music className="h-4 w-4" />
              <span>Atmospheric Music</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* TAB 1: Background Visuals */}
        {activeTab === 'video' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Visual Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white/5 p-3.5 backdrop-blur-md border border-white/10 mb-4 text-xs">
              {/* Toggle Video */}
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Video Backdrop</span>
                <button
                  onClick={onToggleVideoEnabled}
                  className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                    videoEnabled ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white transition-transform ${
                      videoEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Opacity Slider */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/80">Opacity</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={videoOpacity}
                  onChange={(e) => onChangeVideoOpacity(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-white/20 rounded-lg appearance-none accent-indigo-400"
                />
                <span className="font-mono text-[11px] text-white/60">
                  {Math.round(videoOpacity * 100)}%
                </span>
              </div>

              {/* Blur Slider */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/80">Blur</span>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={videoBlur}
                  onChange={(e) => onChangeVideoBlur(parseInt(e.target.value, 10))}
                  className="w-24 h-1 bg-white/20 rounded-lg appearance-none accent-indigo-400"
                />
                <span className="font-mono text-[11px] text-white/60">{videoBlur}px</span>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pr-1 scrollbar-none flex-1">
              {VIDEO_REGISTRY.map((vid) => {
                const isActive = vid.id === activeVideo.id;
                const isFav = favoriteVideoIds.includes(vid.id);

                return (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className={`group relative flex flex-col justify-between rounded-2xl p-4 backdrop-blur-xl border transition cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-medium text-white text-sm">
                            {vid.title}
                          </h4>
                          {isActive && (
                            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                          )}
                        </div>
                        {vid.location && (
                          <p className="text-xs text-white/50 mt-0.5">
                            {vid.location}
                          </p>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteVideo(vid.id);
                        }}
                        className="p-1.5 text-white/40 hover:text-rose-400 transition"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFav ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Atmosphere Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {vid.atmosphereTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-white/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Atmospheric Music */}
        {activeTab === 'music' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1 scrollbar-none flex-1">
              {MUSIC_REGISTRY.map((song) => {
                const isActive = song.id === activeSong.id;
                const isFav = favoriteSongIds.includes(song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      onSelectSong(song);
                    }}
                    className={`group flex items-center justify-between rounded-2xl p-3.5 backdrop-blur-xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Cover Thumbnail / Play button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isActive) {
                            onTogglePlayMusic();
                          } else {
                            onSelectSong(song);
                          }
                        }}
                        className="group/btn relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-indigo-500/20 border border-white/10 shadow-md"
                      >
                        {song.cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={song.cover}
                            alt={song.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Music className="h-5 w-5 text-white/50" />
                        )}
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover/btn:opacity-100'
                          }`}
                        >
                          {isActive && isPlayingMusic ? (
                            <Pause className="h-4 w-4 text-white" />
                          ) : (
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          )}
                        </div>
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">
                            {song.title}
                          </h4>
                          {song.genre && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                              {song.genre}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">
                          {song.artist} • {song.album}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex flex-wrap gap-1">
                        {song.atmosphereTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <span className="font-mono text-xs text-white/50">
                        {formatTimeSeconds(song.duration)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteSong(song.id);
                        }}
                        className="p-1.5 text-white/40 hover:text-rose-400 transition"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFav ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
