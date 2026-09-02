'use client';

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', action: 'Play / Pause Music' },
  { key: '← / →', action: 'Seek Backward / Forward 5s' },
  { key: '↑ / ↓', action: 'Increase / Decrease Volume' },
  { key: 'L', action: 'Toggle Synchronized Lyrics Overlay' },
  { key: 'M', action: 'Mute / Unmute Audio' },
  { key: 'V', action: 'Toggle Background Video' },
  { key: 'F', action: 'Toggle Fullscreen Mode' },
  { key: 'W', action: 'Open World Clock & Saved Hubs' },
  { key: 'A', action: 'Open Ambient Soundboard Mixer' },
  { key: 'S', action: 'Open Visual & Music Studio' },
  { key: 'Esc', action: 'Close any active overlay' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#060812]/85 backdrop-blur-2xl"
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-3xl bg-white/[0.04] p-6 backdrop-blur-3xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-white/50">
                Quick commands for fluid atmosphere control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-xs text-white/90 border border-white/5"
            >
              <span>{s.action}</span>
              <kbd className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs font-semibold text-white border border-white/20 shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
