import { AtmosphereTag, SongMetadata, VideoMetadata } from '@/types';

export const MUSIC_REGISTRY: SongMetadata[] = [
  {
    id: 'song-ghea-1000x',
    title: '1000X',
    artist: 'Ghea Indrawari',
    album: '1000X (Single)',
    cover: '/media/music/ghea-1000x/cover.jpg',
    duration: 275,
    audioSrc: '/media/music/ghea-1000x/audio.mp3',
    lyricsSrc: '/media/music/ghea-1000x/lyrics.lrc',
    atmosphereTags: [
      'night',
      'midnight',
      'calm',
      'focus',
      'clear',
      'rain',
      'golden_hour',
      'sunset',
      'city',
      'morning',
      'dawn',
      'cloudy',
      'fog',
      'storm',
      'nature',
    ],
    genre: 'Pop / Acoustic Ballad',
    ambientType: 'Warm Acoustic & Ethereal Vocals',
  },
];

export const VIDEO_REGISTRY: VideoMetadata[] = [
  {
    id: 'video-ghea-1000x',
    title: 'Ghea Indrawari — 1000X Visualizer',
    location: 'Official Atmosphere Stream',
    videoSrc: '/media/videos/ghea-1000x/video.mp4',
    previewSrc: '/media/videos/ghea-1000x/preview.jpg',
    atmosphereTags: ['night', 'midnight', 'calm', 'focus', 'clear', 'rain', 'sunset', 'city', 'cosmic'],
    backdropTheme: 'night_city',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-rain-night',
    title: 'Midnight Rain over City',
    location: 'Shinjuku, Tokyo',
    videoSrc: '/media/videos/rain/night-rain.mp4',
    previewSrc: '/media/videos/rain/preview.jpg',
    atmosphereTags: ['rain', 'night', 'city', 'focus', 'heavy_rain', 'drizzle'],
    backdropTheme: 'rain',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-sunset-coast',
    title: 'Golden Sunset Coastline',
    location: 'Pacific Rim Coast',
    videoSrc: '/media/videos/sunset/city-sunset.mp4',
    previewSrc: '/media/videos/sunset/preview.jpg',
    atmosphereTags: ['sunset', 'golden_hour', 'nature', 'calm', 'clear'],
    backdropTheme: 'sunset',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-city-night',
    title: 'Neon Metropolis Skyline',
    location: 'Cyber District',
    videoSrc: '/media/videos/night/city-night.mp4',
    previewSrc: '/media/videos/night/preview.jpg',
    atmosphereTags: ['night', 'midnight', 'city', 'focus'],
    backdropTheme: 'night_city',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-misty-forest',
    title: 'Misty Pine Forest at Dawn',
    location: 'Black Forest, Europe',
    videoSrc: '/media/videos/nature/misty-forest.mp4',
    previewSrc: '/media/videos/nature/preview.jpg',
    atmosphereTags: ['fog', 'morning', 'dawn', 'nature', 'calm'],
    backdropTheme: 'forest',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-aurora-borealis',
    title: 'Arctic Aurora & Cosmic Sky',
    location: 'Tromsø, Norway',
    videoSrc: '/media/videos/cosmic/aurora.mp4',
    previewSrc: '/media/videos/cosmic/preview.jpg',
    atmosphereTags: ['clear', 'night', 'cosmic', 'calm', 'midnight'],
    backdropTheme: 'aurora',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-ocean-waves',
    title: 'Deep Oceanic Horizon',
    location: 'Atlantic Expanse',
    videoSrc: '/media/videos/ocean/ocean-waves.mp4',
    previewSrc: '/media/videos/ocean/preview.jpg',
    atmosphereTags: ['cloudy', 'nature', 'calm', 'morning'],
    backdropTheme: 'ocean',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-thunder-storm',
    title: 'Electric Thunder Tempest',
    location: 'Thunder Valley',
    videoSrc: '/media/videos/storm/thunder-storm.mp4',
    previewSrc: '/media/videos/storm/preview.jpg',
    atmosphereTags: ['thunderstorm', 'storm', 'heavy_rain'],
    backdropTheme: 'thunder',
    isAnimatedBackdrop: true,
  },
  {
    id: 'video-snow-mountain',
    title: 'Winter Solitude Ridge',
    location: 'Zermatt, Alps',
    videoSrc: '/media/videos/snow/snow-mountain.mp4',
    previewSrc: '/media/videos/snow/preview.jpg',
    atmosphereTags: ['snow', 'calm', 'morning', 'nature'],
    backdropTheme: 'snow',
    isAnimatedBackdrop: true,
  },
];

/**
 * Matches best soundtrack based on atmospheric tags
 */
export function findBestMatchingSong(tags: AtmosphereTag[]): SongMetadata {
  let bestScore = -1;
  let bestSong = MUSIC_REGISTRY[0];

  for (const song of MUSIC_REGISTRY) {
    let score = 0;
    for (const t of tags) {
      if (song.atmosphereTags.includes(t)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSong = song;
    }
  }

  return bestSong;
}

/**
 * Matches best background video based on atmospheric tags
 */
export function findBestMatchingVideo(tags: AtmosphereTag[]): VideoMetadata {
  let bestScore = -1;
  let bestVideo = VIDEO_REGISTRY[0];

  for (const video of VIDEO_REGISTRY) {
    let score = 0;
    for (const t of tags) {
      if (video.atmosphereTags.includes(t)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestVideo = video;
    }
  }

  return bestVideo;
}
