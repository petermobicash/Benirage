import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Share,
  Heart,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { MultimediaStory, PlaybackState } from '../../types/storytelling';
import Button from '../ui/Button';

interface MultimediaStoryPlayerProps {
  story: MultimediaStory;
  onClose?: () => void;
  className?: string;
}

const MultimediaStoryPlayer: React.FC<MultimediaStoryPlayerProps> = ({
  story,
  onClose,
  className = ''
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: story.audio_duration || story.video_duration || 0,
    volume: 0.7,
    playbackRate: 1,
    isLoading: false
  });

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate mock waveform data for audio visualization
  useEffect(() => {
    if (story.media_type === 'audio' || story.media_type === 'mixed') {
      const mockWaveform = Array.from({ length: 100 }, () =>
        Math.random() * 0.8 + 0.2
      );
      setWaveformData(mockWaveform);
    }
  }, [story.media_type]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && playbackState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, playbackState.isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (playbackState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current && !videoRef.current) return;

    try {
      setPlaybackState(prev => ({ ...prev, isLoading: true }));

      if (story.media_type === 'audio' && audioRef.current) {
        if (playbackState.isPlaying) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
      } else if (story.media_type === 'video' && videoRef.current) {
        if (playbackState.isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      }

      setPlaybackState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Playback error:', error);
      setPlaybackState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to play media'
      }));
    }
  };

  const handleTimeUpdate = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: media.currentTime,
        duration: media.duration || prev.duration
      }));
    }
  };

  const handleLoadedMetadata = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setPlaybackState(prev => ({
        ...prev,
        duration: media.duration,
        isLoading: false
      }));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width - 40; // Account for padding
    const percentage = Math.max(0, Math.min(1, clickX / progressBarWidth));
    const newTime = percentage * playbackState.duration;

    const media = audioRef.current || videoRef.current;
    if (media) {
      media.currentTime = newTime;
      setPlaybackState(prev => ({ ...prev, currentTime: newTime }));
    }
  };

  const toggleMute = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.muted = !media.muted;
      setPlaybackState(prev => ({
        ...prev,
        volume: media.muted ? 0 : media.volume
      }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.volume = volume;
      media.muted = volume === 0;
      setPlaybackState(prev => ({ ...prev, volume }));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderWaveformVisualization = () => {
    if (story.media_type !== 'audio' && story.media_type !== 'mixed') return null;

    return (
      <div className="flex items-center space-x-1 mb-4 px-4">
        {waveformData.map((amplitude, index) => (
          <div
            key={index}
            className={`bg-gradient-to-t ${
              index / waveformData.length < playbackState.currentTime / playbackState.duration
                ? 'from-golden to-dark-blue'
                : 'from-gray-300 to-gray-400'
            } rounded-full transition-all duration-200`}
            style={{
              width: '3px',
              height: `${amplitude * 40 + 4}px`,
              opacity: index / waveformData.length < playbackState.currentTime / playbackState.duration ? 1 : 0.6
            }}
          />
        ))}
      </div>
    );
  };

  const renderMediaContent = () => {
    switch (story.media_type) {
      case 'audio':
        return (
          <div className="relative">
            <audio
              ref={audioRef}
              src={story.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setPlaybackState(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setPlaybackState(prev => ({ ...prev, isPlaying: false }))}
              onEnded={() => setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))}
              className="hidden"
            />

            {/* Audio Visualization */}
            <div className="bg-gradient-to-br from-golden/10 to-dark-blue/10 rounded-lg p-8 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-golden to-dark-blue rounded-full flex items-center justify-center">
                  <Volume2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Audio Story</h3>
                <p className="text-gray-600">Spoken word recording</p>
              </div>

              {renderWaveformVisualization()}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              ref={videoRef}
              src={story.video_url}
              poster={story.thumbnail_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setPlaybackState(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setPlaybackState(prev => ({ ...prev, isPlaying: false }))}
              onEnded={() => setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))}
              className="w-full rounded-lg"
              controls={false}
            />

            {story.transcript && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Transcript</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{story.transcript}</p>
              </div>
            )}
          </div>
        );

      case 'mixed':
        return (
          <div className="space-y-6">
            {story.video_url && (
              <video
                ref={videoRef}
                src={story.video_url}
                poster={story.thumbnail_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setPlaybackState(prev => ({ ...prev, isPlaying: true }))}
                onPause={() => setPlaybackState(prev => ({ ...prev, isPlaying: false }))}
                onEnded={() => setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))}
                className="w-full rounded-lg"
                controls={false}
              />
            )}

            {story.audio_url && (
              <>
                <audio
                  ref={audioRef}
                  src={story.audio_url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setPlaybackState(prev => ({ ...prev, isPlaying: true }))}
                  onPause={() => setPlaybackState(prev => ({ ...prev, isPlaying: false }))}
                  onEnded={() => setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))}
                  className="hidden"
                />

                <div className="bg-gradient-to-br from-golden/10 to-dark-blue/10 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <Volume2 className="w-16 h-16 mx-auto text-gray-600 mb-2" />
                    <h4 className="font-semibold text-gray-800">Audio Companion</h4>
                  </div>
                  {renderWaveformVisualization()}
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.content}</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-white rounded-lg shadow-xl ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playbackState.isPlaying && setShowControls(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-golden to-dark-blue rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {story.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{story.title}</h3>
            <p className="text-sm text-gray-600">
              by {story.is_anonymous ? 'Anonymous' : story.author_name}
              {story.author_location && ` • ${story.author_location}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" icon={Share}>
            Share
          </Button>
          <Button variant="outline" size="sm" icon={Heart}>
            Like
          </Button>
          <Button variant="outline" size="sm" icon={Bookmark}>
            Save
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Media Content */}
      <div className="p-6">
        {renderMediaContent()}
      </div>

      {/* Playback Controls */}
      {(story.media_type === 'audio' || story.media_type === 'video' || story.media_type === 'mixed') && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !playbackState.isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="space-y-3">
            {/* Progress Bar */}
            <div
              className="relative h-1 bg-white/30 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="absolute h-full bg-golden rounded-full transition-all duration-100"
                style={{ width: `${(playbackState.currentTime / playbackState.duration) * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  disabled={playbackState.isLoading}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  {playbackState.isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : playbackState.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    {playbackState.volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={playbackState.volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <span className="text-sm font-mono">
                  {formatTime(playbackState.currentTime)} / {formatTime(playbackState.duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" icon={Download}>
                  Download
                </Button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Metadata */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              12 Comments
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              24 Likes
            </span>
          </div>
          <span>{new Date(story.submitted_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MultimediaStoryPlayer;