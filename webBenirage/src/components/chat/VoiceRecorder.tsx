import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

// Type for webkit audio context
interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds
  className?: string;
}

interface AudioVisualizationProps {
  audioData: number[];
  isRecording: boolean;
  className?: string;
}

const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  audioData,
  isRecording,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {audioData.map((amplitude, index) => (
        <div
          key={index}
          className={`bg-blue-500 rounded-full transition-all duration-75 ${
            isRecording ? 'animate-pulse' : ''
          }`}
          style={{
            width: '3px',
            height: `${Math.max(4, amplitude * 50)}px`,
          }}
        />
      ))}
    </div>
  );
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 300, // 5 minutes default
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
      return false;
    }
  };

  // Set up audio visualization
  const setupAudioVisualization = () => {
    if (!streamRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualization = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Convert to amplitude values (0-1 range)
        const amplitudes = Array.from(dataArray.slice(0, 32)).map(value => value / 255);
        setAudioData(amplitudes);

        if (isRecording && !isPaused) {
          animationFrameRef.current = requestAnimationFrame(updateVisualization);
        }
      };

      updateVisualization();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      if (!streamRef.current) return;

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob, duration);
        cleanup();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 0.1;
        });
      }, 100);

      setupAudioVisualization();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      // Resume duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    onCancel?.();
  };

  // Cleanup resources
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioData([]);
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centisecs = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${centisecs}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  if (hasPermission === false) {
    return (
      <div className={`flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <MicOff className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-700">Microphone access denied</span>
        <Button
          size="sm"
          variant="outline"
          onClick={requestMicrophonePermission}
          className="text-red-600 border-red-300 hover:bg-red-100"
        >
          Allow Access
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-lg ${className}`}>
      {/* Recording Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isRecording ? (isPaused ? 'Recording Paused' : 'Recording...') : 'Voice Recorder'}
          </span>
        </div>
        <div className="text-sm font-mono text-gray-600">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </div>
      </div>

      {/* Audio Visualization */}
      {isRecording && (
        <div className="mb-4">
          <AudioVisualization
            audioData={audioData}
            isRecording={isRecording && !isPaused}
            className="justify-center"
          />
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-100 ${
              duration / maxDuration > 0.8 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((duration / maxDuration) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
            size="sm"
          >
            <Mic className="w-5 h-5" />
          </Button>
        ) : (
          <>
            <Button
              onClick={togglePause}
              variant="outline"
              className={`rounded-full p-3 ${
                isPaused ? 'border-green-500 text-green-600 hover:bg-green-50' : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
              }`}
              size="sm"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>

            <Button
              onClick={stopRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3"
              size="sm"
            >
              <Square className="w-4 h-4" />
            </Button>

            <Button
              onClick={cancelRecording}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 rounded-full p-3"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Recording Tips */}
      {!isRecording && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Tap the microphone to start recording. Maximum duration: {Math.floor(maxDuration / 60)} minutes.
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;