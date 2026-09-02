'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LocationData,
  WeatherBundle,
  AstronomicalData,
  AtmosphereState,
  UserPreferences,
  SongMetadata,
  VideoMetadata,
  SavedCity,
} from '@/types';
import {
  fetchWeatherData,
  getFallbackWeatherData,
  POPULAR_CITIES,
} from '@/lib/weather/openmeteo';
import { calculateAstronomicalData } from '@/lib/astronomy/solar-lunar';
import { resolveAtmosphereState } from '@/lib/atmosphere/engine';
import {
  MUSIC_REGISTRY,
  VIDEO_REGISTRY,
  findBestMatchingSong,
  findBestMatchingVideo,
} from '@/lib/media/registry';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  addSavedCity,
  removeSavedCity,
} from '@/lib/storage/preferences';
import {
  ambientEngine,
  DEFAULT_AMBIENT_CHANNELS,
  AmbientTrackState,
} from '@/lib/audio/synth-ambient';
import { audioManager } from '@/lib/audio/audio-context';
import { synthMusicPlayer } from '@/lib/audio/synth-music';
import { getLocalHourInTimezone } from '@/lib/utils/formatters';

// Components
import { AtmosphereHeader } from '@/components/atmosphere/AtmosphereHeader';
import { VideoBackground } from '@/components/atmosphere/VideoBackground';
import { AtmosphereCanvas } from '@/components/atmosphere/AtmosphereCanvas';
import { WeatherHero } from '@/components/atmosphere/WeatherHero';
import { AtmosphereTimeline } from '@/components/atmosphere/AtmosphereTimeline';
import { WeatherMetricsGrid } from '@/components/atmosphere/WeatherMetricsGrid';
import { HourlyForecast } from '@/components/atmosphere/HourlyForecast';
import { MusicPlayerDock } from '@/components/player/MusicPlayerDock';
import { LyricsOverlay } from '@/components/player/LyricsOverlay';
import { AmbientSoundboard } from '@/components/player/AmbientSoundboard';
import { MediaSelectorModal } from '@/components/player/MediaSelectorModal';
import { WorldClockModal } from '@/components/world/WorldClockModal';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';

export default function NoctraDashboard() {
  // 1. Initial State
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [currentLocation, setCurrentLocation] = useState<LocationData>(POPULAR_CITIES[0]);
  const [weatherBundle, setWeatherBundle] = useState<WeatherBundle>(() =>
    getFallbackWeatherData(POPULAR_CITIES[0].timezone)
  );
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // 2. Time & Time Travel Scrubber State
  const [liveDate, setLiveDate] = useState<Date>(new Date());
  const [simulatedHour, setSimulatedHour] = useState<number>(() => {
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  });
  const [isTimeScrubbed, setIsTimeScrubbed] = useState<boolean>(false);

  // 3. Media & Audio State
  const [activeVideo, setActiveVideo] = useState<VideoMetadata>(VIDEO_REGISTRY[0]);
  const [activeSong, setActiveSong] = useState<SongMetadata>(MUSIC_REGISTRY[0]);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState<number>(0);
  const [musicDuration, setMusicDuration] = useState<number>(MUSIC_REGISTRY[0].duration);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [ambientChannels, setAmbientChannels] = useState<AmbientTrackState[]>(DEFAULT_AMBIENT_CHANNELS);
  const [ambientMasterVolume, setAmbientMasterVolume] = useState<number>(0.6);

  // 4. Modals State
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState<boolean>(false);
  const [isWorldClockOpen, setIsWorldClockOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const useProceduralSynthAudioRef = useRef<boolean>(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const prefs = loadPreferences();
    setPreferences(prefs);
    setAmbientMasterVolume(prefs.ambientMasterVolume ?? 0.6);

    // Find last saved city if available
    if (prefs.lastCityId) {
      const match =
        prefs.savedCities.find((c) => c.id === prefs.lastCityId) ||
        POPULAR_CITIES.find((c) => c.id === prefs.lastCityId);
      if (match) {
        setCurrentLocation({
          id: match.id,
          name: match.name,
          admin1: match.admin1,
          country: match.country,
          countryCode: match.countryCode,
          latitude: match.latitude,
          longitude: match.longitude,
          timezone: match.timezone,
        });
      }
    }
  }, []);

  // Sync active ambient channels into procedural engine
  useEffect(() => {
    ambientEngine.syncAllChannels(ambientChannels);
  }, [ambientChannels]);

  // Master ambient volume sync
  useEffect(() => {
    if (typeof window !== 'undefined' && audioManager) {
      audioManager.setAmbientMasterGain(ambientMasterVolume);
    }
  }, [ambientMasterVolume]);

  // Real-time live clock ticker (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLiveDate(now);
      if (!isTimeScrubbed) {
        setSimulatedHour(getLocalHourInTimezone(now, currentLocation.timezone));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimeScrubbed, currentLocation.timezone]);

  // Fetch real-time weather when location changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);

    fetchWeatherData(currentLocation.latitude, currentLocation.longitude, currentLocation.timezone)
      .then((bundle) => {
        if (isMounted) {
          setWeatherBundle(bundle);
          setIsLoadingWeather(false);
        }
      })
      .catch((err) => {
        console.error('Weather fetch error:', err);
        if (isMounted) {
          setWeatherBundle(getFallbackWeatherData(currentLocation.timezone));
          setIsLoadingWeather(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  // Compute effective date for astronomical calculations
  const effectiveDate = React.useMemo(() => {
    if (!isTimeScrubbed) return liveDate;
    const d = new Date(liveDate);
    const h = Math.floor(simulatedHour);
    const m = Math.floor((simulatedHour % 1) * 60);
    d.setHours(h, m, 0, 0);
    return d;
  }, [liveDate, simulatedHour, isTimeScrubbed]);

  // Compute Astronomical Data
  const astroData: AstronomicalData = React.useMemo(() => {
    return calculateAstronomicalData(
      effectiveDate,
      currentLocation.latitude,
      currentLocation.longitude,
      weatherBundle.daily.sunrise[0],
      weatherBundle.daily.sunset[0]
    );
  }, [effectiveDate, currentLocation, weatherBundle.daily]);

  // Compute Atmosphere State
  const atmosphereState: AtmosphereState = React.useMemo(() => {
    return resolveAtmosphereState(weatherBundle.current, astroData, currentLocation);
  }, [weatherBundle.current, astroData, currentLocation]);

  // Auto-adapt recommended media if not manually locked
  useEffect(() => {
    const recommendedVideo =
      VIDEO_REGISTRY.find((v) => v.id === atmosphereState.recommendedVideoId) || VIDEO_REGISTRY[0];
    const recommendedSong =
      MUSIC_REGISTRY.find((s) => s.id === atmosphereState.recommendedSongId) || MUSIC_REGISTRY[0];

    setActiveVideo(recommendedVideo);
    if (!isPlayingMusic) {
      setActiveSong(recommendedSong);
      setMusicDuration(recommendedSong.duration);
    }
  }, [atmosphereState.recommendedVideoId, atmosphereState.recommendedSongId]);

  // Audio Playback Engine Logic
  const playSong = useCallback(
    (song: SongMetadata, offset = 0) => {
      setActiveSong(song);
      setMusicDuration(song.duration);
      setIsPlayingMusic(true);

      if (typeof window !== 'undefined' && audioManager) {
        audioManager.getContext().resume().catch(() => {});
      }

      const audio = audioRef.current;
      if (audio) {
        if (!audio.src || !audio.src.endsWith(song.audioSrc)) {
          audio.src = song.audioSrc;
        }
        audio.currentTime = offset;
        audio.volume = preferences.musicVolume;

        audio
          .play()
          .then(() => {
            useProceduralSynthAudioRef.current = false;
            synthMusicPlayer.stop();
            if (audioManager) audioManager.connectMediaElement(audio);
          })
          .catch((err) => {
            console.warn('Audio play error, falling back to procedural synthesizer:', err);
            useProceduralSynthAudioRef.current = true;
            synthMusicPlayer.play(song.id, offset);
          });
      }
    },
    [preferences.musicVolume]
  );

  const togglePlayMusic = useCallback(() => {
    if (typeof window !== 'undefined' && audioManager) {
      audioManager.getContext().resume().catch(() => {});
    }

    if (isPlayingMusic) {
      setIsPlayingMusic(false);
      if (audioRef.current && !useProceduralSynthAudioRef.current) {
        audioRef.current.pause();
      } else {
        synthMusicPlayer.pause();
      }
    } else {
      setIsPlayingMusic(true);
      const audio = audioRef.current;
      if (audio) {
        if (!audio.src || !audio.src.endsWith(activeSong.audioSrc)) {
          audio.src = activeSong.audioSrc;
          audio.currentTime = musicCurrentTime;
        }
        audio.volume = preferences.musicVolume;
        audio
          .play()
          .then(() => {
            useProceduralSynthAudioRef.current = false;
            synthMusicPlayer.stop();
            if (audioManager) audioManager.connectMediaElement(audio);
          })
          .catch(() => {
            useProceduralSynthAudioRef.current = true;
            synthMusicPlayer.play(activeSong.id, musicCurrentTime);
          });
      } else {
        useProceduralSynthAudioRef.current = true;
        synthMusicPlayer.play(activeSong.id, musicCurrentTime);
      }
    }
  }, [isPlayingMusic, activeSong, musicCurrentTime, preferences.musicVolume]);

  const handleNextSong = useCallback(() => {
    const currentIndex = MUSIC_REGISTRY.findIndex((s) => s.id === activeSong.id);
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * MUSIC_REGISTRY.length);
    } else {
      nextIndex = (currentIndex + 1) % MUSIC_REGISTRY.length;
    }
    playSong(MUSIC_REGISTRY[nextIndex]);
  }, [activeSong.id, isShuffle, playSong]);

  const handlePrevSong = useCallback(() => {
    if (musicCurrentTime > 4) {
      if (audioRef.current && !useProceduralSynthAudioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setMusicCurrentTime(0);
      return;
    }
    const currentIndex = MUSIC_REGISTRY.findIndex((s) => s.id === activeSong.id);
    const prevIndex = (currentIndex - 1 + MUSIC_REGISTRY.length) % MUSIC_REGISTRY.length;
    playSong(MUSIC_REGISTRY[prevIndex]);
  }, [musicCurrentTime, activeSong.id, playSong]);

  const handleSeek = useCallback(
    (targetTime: number) => {
      setMusicCurrentTime(targetTime);
      if (audioRef.current && !useProceduralSynthAudioRef.current) {
        audioRef.current.currentTime = targetTime;
      } else {
        synthMusicPlayer.play(activeSong.id, targetTime);
      }
    },
    [activeSong.id]
  );

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setPreferences((prev) => ({ ...prev, musicVolume: clamped }));
    savePreferences({ musicVolume: clamped });
    if (audioRef.current) audioRef.current.volume = clamped;
    synthMusicPlayer.setVolume(clamped);
  }, []);

  // Real-time audio time update ticker
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!useProceduralSynthAudioRef.current) {
        setMusicCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setMusicDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Also interval for procedural synth audio progress tracking
    const synthTimer = setInterval(() => {
      if (isPlayingMusic && useProceduralSynthAudioRef.current) {
        const t = synthMusicPlayer.getCurrentTime();
        setMusicCurrentTime(t % (activeSong.duration || 180));
      }
    }, 200);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      clearInterval(synthTimer);
    };
  }, [repeatMode, handleNextSong, isPlayingMusic, activeSong.duration]);

  // Ambient soundboard handlers
  const handleToggleAmbientChannel = (id: string) => {
    setAmbientChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleChangeAmbientVolume = (id: string, vol: number) => {
    setAmbientChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, volume: vol } : c))
    );
  };

  const handleApplyAmbientPreset = (presetName: string) => {
    setAmbientChannels((prev) => {
      const copy = prev.map((c) => ({ ...c, enabled: false }));
      if (presetName === 'Rainy Night') {
        return copy.map((c) =>
          c.id === 'amb-rain' || c.id === 'amb-thunder' || c.id === 'amb-vinyl'
            ? { ...c, enabled: true }
            : c
        );
      } else if (presetName === 'Astral Calm') {
        return copy.map((c) =>
          c.id === 'amb-astral' || c.id === 'amb-wind' ? { ...c, enabled: true } : c
        );
      } else if (presetName === 'Deep Ocean') {
        return copy.map((c) =>
          c.id === 'amb-ocean' || c.id === 'amb-wind' ? { ...c, enabled: true } : c
        );
      } else if (presetName === 'Urban Evening') {
        return copy.map((c) =>
          c.id === 'amb-city' || c.id === 'amb-crickets' ? { ...c, enabled: true } : c
        );
      }
      return copy;
    });
  };

  const handleStopAllAmbient = () => {
    ambientEngine.stopAll();
    setAmbientChannels((prev) => prev.map((c) => ({ ...c, enabled: false })));
  };

  // Saved Cities Handlers
  const handleSelectLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    setIsTimeScrubbed(false);
    setSimulatedHour(getLocalHourInTimezone(new Date(), loc.timezone));
    savePreferences({ lastCityId: loc.id });
  };

  const handleAddCity = (city: SavedCity) => {
    const updated = addSavedCity(city);
    setPreferences((prev) => ({ ...prev, savedCities: updated }));
  };

  const handleRemoveCity = (cityId: string) => {
    const updated = removeSavedCity(cityId);
    setPreferences((prev) => ({ ...prev, savedCities: updated }));
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside search or input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayMusic();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, musicCurrentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(musicDuration, musicCurrentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(preferences.musicVolume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(preferences.musicVolume - 0.05);
          break;
        case 'KeyL':
          e.preventDefault();
          setIsLyricsOpen((prev) => !prev);
          break;
        case 'KeyV':
          e.preventDefault();
          setPreferences((prev) => {
            const next = !prev.videoEnabled;
            savePreferences({ videoEnabled: next });
            return { ...prev, videoEnabled: next };
          });
          break;
        case 'KeyW':
          e.preventDefault();
          setIsWorldClockOpen((prev) => !prev);
          break;
        case 'KeyA':
          e.preventDefault();
          setIsSoundboardOpen((prev) => !prev);
          break;
        case 'KeyS':
          e.preventDefault();
          setIsMediaSelectorOpen((prev) => !prev);
          break;
        case 'KeyF':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        case 'Escape':
          setIsLyricsOpen(false);
          setIsSoundboardOpen(false);
          setIsMediaSelectorOpen(false);
          setIsWorldClockOpen(false);
          setIsShortcutsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlayMusic,
    handleSeek,
    musicCurrentTime,
    musicDuration,
    handleVolumeChange,
    preferences.musicVolume,
  ]);

  const activeAmbientCount = ambientChannels.filter((c) => c.enabled).length;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between pb-32">
      {/* Hidden Audio Element for local MP3/WAV tracks */}
      <audio ref={audioRef} preload="auto" src={activeSong.audioSrc} />

      {/* 1. Dynamic Video Background Layer */}
      <VideoBackground
        activeVideo={activeVideo}
        enabled={preferences.videoEnabled}
        opacity={preferences.videoOpacity}
        blur={preferences.videoBlur}
        bgGradient={atmosphereState.bgGradient}
        theme={activeVideo.backdropTheme}
        isPlaying={isPlayingMusic}
        currentTime={musicCurrentTime}
      />

      {/* 2. Real-Time Canvas Particle Engine Overlay */}
      <AtmosphereCanvas
        particleType={atmosphereState.particleType}
        density={atmosphereState.particleDensity}
        accentColor={atmosphereState.accentColor}
        isDaytime={astroData.isDaytime}
      />

      {/* 3. Header & Navigation */}
      <AtmosphereHeader
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        onOpenWorldClock={() => setIsWorldClockOpen(true)}
        onOpenMediaSelector={() => setIsMediaSelectorOpen(true)}
        onOpenSoundboard={() => setIsSoundboardOpen(true)}
        isTimeScrubbed={isTimeScrubbed}
        onResetTime={() => setIsTimeScrubbed(false)}
        simulatedDate={effectiveDate}
        tempUnit={preferences.temperatureUnit}
        onToggleTempUnit={() => {
          const next = preferences.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
          setPreferences((p) => ({ ...p, temperatureUnit: next }));
          savePreferences({ temperatureUnit: next });
        }}
        isDaytime={astroData.isDaytime}
      />

      {/* 4. Central Stage Content Area */}
      <div className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex flex-col justify-center">
        {/* Weather Hero */}
        <WeatherHero
          location={currentLocation}
          weather={weatherBundle.current}
          daily={weatherBundle.daily}
          astro={astroData}
          atmosphere={atmosphereState}
          tempUnit={preferences.temperatureUnit}
          simulatedDate={effectiveDate}
        />

        {/* Atmosphere Solar Timeline & Time Travel Scrubber */}
        <AtmosphereTimeline
          astro={astroData}
          daily={weatherBundle.daily}
          timezone={currentLocation.timezone}
          simulatedHour={simulatedHour}
          onScrubHour={(hour) => {
            setIsTimeScrubbed(true);
            setSimulatedHour(hour);
          }}
          onReset={() => setIsTimeScrubbed(false)}
          isScrubbed={isTimeScrubbed}
          accentColor={atmosphereState.accentColor}
        />

        {/* 24-Hour Forecast Trajectory */}
        <HourlyForecast
          hourly={weatherBundle.hourly}
          timezone={currentLocation.timezone}
          tempUnit={preferences.temperatureUnit}
          selectedHour={simulatedHour}
          onSelectHour={(hour) => {
            setIsTimeScrubbed(true);
            setSimulatedHour(hour);
          }}
        />

        {/* Comprehensive Environmental & Astronomical Deep Dive Grid */}
        <WeatherMetricsGrid
          weather={weatherBundle.current}
          astro={astroData}
          airQuality={weatherBundle.airQuality}
          daily={weatherBundle.daily}
          timezone={currentLocation.timezone}
          windSpeedUnit={preferences.windSpeedUnit}
          accentColor={atmosphereState.accentColor}
        />

        {/* Keyboard shortcut hint pill */}
        <div className="flex items-center justify-center my-4">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="rounded-full bg-white/5 px-3.5 py-1 text-xs text-white/50 hover:text-white/80 backdrop-blur-md border border-white/5 hover:border-white/10 transition"
          >
            Press <kbd className="font-mono text-[10px] text-white/80">?</kbd> or click for Keyboard Shortcuts
          </button>
        </div>
      </div>

      {/* 5. Glass Bottom Music Player Dock */}
      <MusicPlayerDock
        currentSong={activeSong}
        isPlaying={isPlayingMusic}
        onTogglePlay={togglePlayMusic}
        onNextSong={handleNextSong}
        onPrevSong={handlePrevSong}
        currentTime={musicCurrentTime}
        duration={musicDuration}
        onSeek={handleSeek}
        volume={preferences.musicVolume}
        onChangeVolume={handleVolumeChange}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        repeatMode={repeatMode}
        onCycleRepeat={() => {
          setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
        }}
        isLyricsOpen={isLyricsOpen}
        onToggleLyrics={() => setIsLyricsOpen((prev) => !prev)}
        isSoundboardOpen={isSoundboardOpen}
        onToggleSoundboard={() => setIsSoundboardOpen((prev) => !prev)}
        isMediaSelectorOpen={isMediaSelectorOpen}
        onToggleMediaSelector={() => setIsMediaSelectorOpen((prev) => !prev)}
        activeAmbientCount={activeAmbientCount}
        accentColor={atmosphereState.accentColor}
      />

      {/* 6. Overlays & Modals */}
      <LyricsOverlay
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        song={activeSong}
        currentTime={musicCurrentTime}
        onSeek={handleSeek}
        accentColor={atmosphereState.accentColor}
      />

      <AmbientSoundboard
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        channels={ambientChannels}
        onToggleChannel={handleToggleAmbientChannel}
        onChangeChannelVolume={handleChangeAmbientVolume}
        masterVolume={ambientMasterVolume}
        onChangeMasterVolume={(v) => {
          setAmbientMasterVolume(v);
          savePreferences({ ambientMasterVolume: v });
        }}
        onApplyPreset={handleApplyAmbientPreset}
        onStopAll={handleStopAllAmbient}
        accentColor={atmosphereState.accentColor}
      />

      <MediaSelectorModal
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        activeVideo={activeVideo}
        onSelectVideo={(v) => {
          setActiveVideo(v);
          savePreferences({ activeVideoId: v.id });
        }}
        activeSong={activeSong}
        onSelectSong={(s) => {
          playSong(s);
          savePreferences({ activeSongId: s.id });
        }}
        isPlayingMusic={isPlayingMusic}
        onTogglePlayMusic={togglePlayMusic}
        videoEnabled={preferences.videoEnabled}
        onToggleVideoEnabled={() => {
          const next = !preferences.videoEnabled;
          setPreferences((p) => ({ ...p, videoEnabled: next }));
          savePreferences({ videoEnabled: next });
        }}
        videoOpacity={preferences.videoOpacity}
        onChangeVideoOpacity={(val) => {
          setPreferences((p) => ({ ...p, videoOpacity: val }));
          savePreferences({ videoOpacity: val });
        }}
        videoBlur={preferences.videoBlur}
        onChangeVideoBlur={(val) => {
          setPreferences((p) => ({ ...p, videoBlur: val }));
          savePreferences({ videoBlur: val });
        }}
        favoriteSongIds={preferences.favoriteSongIds}
        onToggleFavoriteSong={(id) => {
          const exists = preferences.favoriteSongIds.includes(id);
          const updated = exists
            ? preferences.favoriteSongIds.filter((x) => x !== id)
            : [...preferences.favoriteSongIds, id];
          setPreferences((p) => ({ ...p, favoriteSongIds: updated }));
          savePreferences({ favoriteSongIds: updated });
        }}
        favoriteVideoIds={preferences.favoriteVideoIds}
        onToggleFavoriteVideo={(id) => {
          const exists = preferences.favoriteVideoIds.includes(id);
          const updated = exists
            ? preferences.favoriteVideoIds.filter((x) => x !== id)
            : [...preferences.favoriteVideoIds, id];
          setPreferences((p) => ({ ...p, favoriteVideoIds: updated }));
          savePreferences({ favoriteVideoIds: updated });
        }}
        accentColor={atmosphereState.accentColor}
      />

      <WorldClockModal
        isOpen={isWorldClockOpen}
        onClose={() => setIsWorldClockOpen(false)}
        savedCities={preferences.savedCities}
        currentCityId={currentLocation.id}
        onSelectCity={(city) => {
          handleSelectLocation({
            id: city.id,
            name: city.name,
            country: city.country,
            countryCode: city.countryCode,
            admin1: city.admin1,
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: city.timezone,
          });
        }}
        onAddCity={handleAddCity}
        onRemoveCity={handleRemoveCity}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </main>
  );
}
