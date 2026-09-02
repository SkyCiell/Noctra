'use client';

import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  CloudRain,
  Zap,
  Wind,
  Moon,
  Waves,
  Building,
  Sparkles,
  Disc,
  Power,
} from 'lucide-react';
import { AmbientTrackState } from '@/lib/audio/synth-ambient';

interface AmbientSoundboardProps {
  isOpen: boolean;
  onClose: () => void;
  channels: AmbientTrackState[];
  onToggleChannel: (id: string) => void;
  onChangeChannelVolume: (id: string, vol: number) => void;
  masterVolume: number;
  onChangeMasterVolume: (vol: number) => void;
  onApplyPreset: (presetName: string) => void;
  onStopAll: () => void;
  accentColor?: string;
}

const ICONS_MAP: Record<string, React.ElementType> = {
  rain: CloudRain,
  thunder: Zap,
  wind: Wind,
  night_crickets: Moon,
  ocean: Waves,
  city: Building,
  astral_drone: Sparkles,
  vinyl: Disc,
};

export const AmbientSoundboard: React.FC<AmbientSoundboardProps> = ({
  isOpen,
  onClose,
  channels,
  onToggleChannel,
  onChangeChannelVolume,
  masterVolume,
  onChangeMasterVolume,
  onApplyPreset,
  onStopAll,
  accentColor = '#6366f1',
}) => {
  if (!isOpen) return null;

  const presets = [
    { name: 'Rainy Night', desc: 'Rain + Thunder + Vinyl' },
    { name: 'Astral Calm', desc: '432Hz Astral Drone + Wind' },
    { name: 'Deep Ocean', desc: 'Ocean Waves + Wind' },
    { name: 'Urban Evening', desc: 'City Hum + Night Crickets' },
  ];

  const anyActive = channels.some((c) => c.enabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#060812]/85 backdrop-blur-2xl"
      />

      {/* Main Drawer / Modal */}
      <div className="relative z-10 flex h-auto max-h-[88vh] w-full max-w-[96vw] sm:max-w-2xl flex-col rounded-2xl sm:rounded-3xl bg-white/[0.04] p-3.5 sm:p-6 backdrop-blur-3xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold text-white tracking-wide truncate">
                Ambient Soundboard
              </h2>
              <p className="text-[10px] sm:text-xs text-white/50 truncate">
                Procedural Web Audio environment layers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {anyActive && (
              <button
                onClick={onStopAll}
                className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] sm:text-xs text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition active:scale-95"
              >
                <Power className="h-3 w-3" />
                <span>Mute All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition active:scale-95"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Master Ambient Volume Slider */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-white/5 p-2.5 sm:p-3.5 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 shrink-0">
            {masterVolume > 0 ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />}
            <span className="hidden xs:inline">Master Ambient</span>
            <span className="xs:hidden">Master</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-36 xs:w-48">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onChangeMasterVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <span className="w-8 text-right font-mono text-[11px] sm:text-xs text-white/60">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[50vh] pr-1 scrollbar-none py-1">
          {channels.map((ch) => {
            const IconComponent = ICONS_MAP[ch.type] || Volume2;

            return (
              <div
                key={ch.id}
                className={`flex flex-col justify-between rounded-2xl p-3.5 backdrop-blur-xl border transition ${
                  ch.enabled
                    ? 'bg-white/10 border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                        ch.enabled
                          ? 'bg-indigo-500/30 text-indigo-300'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-white">
                      {ch.name}
                    </span>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => onToggleChannel(ch.id)}
                    className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                      ch.enabled ? 'bg-indigo-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${
                        ch.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Individual Channel Fader */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    disabled={!ch.enabled}
                    value={ch.volume}
                    onChange={(e) =>
                      onChangeChannelVolume(ch.id, parseFloat(e.target.value))
                    }
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400 disabled:opacity-30"
                  />
                  <span className="w-8 text-right font-mono text-[10px] text-white/50">
                    {Math.round(ch.volume * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Atmosphere Presets */}
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-2">
            Quick Atmosphere Soundscapes
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onApplyPreset(p.name)}
                className="flex flex-col items-center justify-center rounded-xl bg-white/5 p-2 text-center text-xs text-white/80 hover:bg-white/10 hover:text-white transition border border-white/5"
              >
                <span className="font-medium text-white text-[11px]">{p.name}</span>
                <span className="text-[9px] text-white/40 mt-0.5">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
