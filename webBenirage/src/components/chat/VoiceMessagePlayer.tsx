import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import Button from '../ui/Button';

// Type for webkit audio context
interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface VoiceMessagePlayerProps {
  audioUrl?: string;
  audioBlob?: Blob;
  duration?: number; // in seconds
  className?: string;
  showDownload?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

interface AudioVisualizationProps {
  audioData: number[];
  isPlaying: boolean;
  progress: number;
  className?: string;
}

const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  audioData,
  isPlaying,
  progress,
  className = ''
}) => {
  const barCount = 20;

  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {Array.from({ length: barCount }, (_, index) => {
        const groupProgress = progress * barCount;
        const isActive = index < groupProgress;

        // Use audioData for visualization
        const baseHeight = 4;
        const maxHeight = 20;
        const amplitude = audioData[index] || 0;
        const height = baseHeight + (amplitude * (maxHeight - baseHeight));

        return (
          <div
            key={index}
            className={`bg-blue-500 rounded-full transition-all duration-150 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            style={{
              width: '2px',
              height: `${Math.max(4, height)}px`,
              opacity: isActive ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
};

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  audioUrl,
  audioBlob,
  duration,
  className = '',
  showDownload = true,
  onPlay,
  onPause,
  onEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize audio context and visualization
  const setupAudioVisualization = () => {
    if (!audioRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualization = () => {
        if (!analyserRef.current || !isPlaying) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Convert to amplitude values (0-1 range) and smooth the data
        const amplitudes = Array.from(dataArray.slice(0, 20)).map(value => value / 255);
        setAudioData(amplitudes);

        if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(updateVisualization);
        }
      };

      updateVisualization();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnd?.();
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    audioRef.current = audio;

    // Set audio source
    if (audioBlob) {
      const blobUrl = URL.createObjectURL(audioBlob);
      audio.src = blobUrl;
    } else if (audioUrl) {
      audio.src = audioUrl;
    } else {
      setError('No audio source provided');
      setIsLoading(false);
      return;
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up blob URL if it exists
      if (audioBlob && audio.src) {
        URL.revokeObjectURL(audio.src);
      }
    };
  }, [audioUrl, audioBlob, onEnd, onPause, onPlay]);

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Resume audio context if needed
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        setupAudioVisualization();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setError('Failed to play audio');
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || audioDuration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioDuration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Download audio
  const downloadAudio = () => {
    if (!audioBlob && !audioUrl) return;

    const url = audioBlob ? URL.createObjectURL(audioBlob) : audioUrl;
    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-message-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (audioBlob) {
      URL.revokeObjectURL(url);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? currentTime / audioDuration : 0;

  if (error) {
    return (
      <div className={`flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <VolumeX className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-3">
        <div
          className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress * 100}%` }}
          >
            <div className="absolute right-0 top-0 w-3 h-2 bg-white rounded-full shadow-sm transform translate-x-1/2 -translate-y-0"></div>
          </div>
        </div>
      </div>

      {/* Controls and Visualization */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`rounded-full p-2 ${
              isPlaying
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
            size="sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          {/* Audio Visualization */}
          <AudioVisualization
            audioData={audioData}
            isPlaying={isPlaying}
            progress={progress}
            className="flex-1"
          />
        </div>

        {/* Time Display */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-mono">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>

          {/* Volume Control */}
          <div className="flex items-center space-x-1">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-12 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Download Button */}
          {showDownload && (audioBlob || audioUrl) && (
            <Button
              onClick={downloadAudio}
              variant="ghost"
              size="sm"
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;