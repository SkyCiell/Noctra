'use client';

import React, { useEffect, useRef } from 'react';
import { audioManager } from '@/lib/audio/audio-context';

interface AudioVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  accentColor = '#6366f1',
  barCount = 28,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let dataArray: Uint8Array | null = null;
      if (typeof window !== 'undefined' && audioManager) {
        try {
          const analyser = audioManager.getAnalyser();
          const bufferLength = analyser.frequencyBinCount;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dataArray = new Uint8Array(bufferLength);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          analyser.getByteFrequencyData(dataArray as any);
        } catch {
          dataArray = null;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / barCount) * 0.65;
      const spacing = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        let value = 0;
        if (isPlaying && dataArray) {
          const dataIndex = Math.floor((i / barCount) * (dataArray.length * 0.6));
          value = (dataArray[dataIndex] || 0) / 255;
        } else if (isPlaying) {
          // Simulated pleasant wave if analyser has no audio source yet
          value = 0.2 + Math.sin(Date.now() * 0.005 + i * 0.3) * 0.15;
        } else {
          // Idle low wave
          value = 0.05 + Math.sin(Date.now() * 0.002 + i * 0.2) * 0.03;
        }

        const barHeight = Math.max(3, value * (height - 4));
        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Draw rounded bar
        ctx.fillStyle = isPlaying ? accentColor : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, accentColor, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={28}
      className="h-7 w-28 opacity-90 transition-opacity"
    />
  );
};
