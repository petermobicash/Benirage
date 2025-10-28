import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Users, Maximize, Minimize } from 'lucide-react';
import Button from '../ui/Button';

interface VideoCallInterfaceProps {
  participants: CallParticipant[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isCallActive: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShareScreen: () => void;
  onEndCall: () => void;
  onToggleFullscreen?: () => void;
  className?: string;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isLocalUser: boolean;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  participants,
  localStream,
  remoteStreams,
  isCallActive,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  onEndCall,
  onToggleFullscreen,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Track call duration
  useEffect(() => {
    if (isCallActive) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isCallActive]);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    onToggleFullscreen?.();
  };

  // Handle audio toggle
  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio();
  };

  // Handle video toggle
  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo();
  };

  // Handle screen share toggle
  const handleShareScreen = () => {
    setIsScreenSharing(!isScreenSharing);
    onShareScreen();
  };

  // Handle end call
  const handleEndCall = () => {
    onEndCall();
  };

  // Get grid layout based on participant count
  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  const remoteParticipants = participants.filter(p => !p.isLocalUser);
  const gridCols = getGridLayout(remoteParticipants.length + 1);

  if (!isCallActive) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? 'rounded-none' : 'rounded-lg m-4'} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">Video Call</span>
          </div>
          <div className="text-gray-300 text-sm font-mono">
            {formatDuration(callDuration)}
          </div>
          <div className="flex items-center space-x-1 text-gray-300">
            <Users className="w-4 h-4" />
            <span className="text-sm">{participants.length}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/10 rounded-full p-2"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreenToggle}
            className="text-white hover:bg-white/10 rounded-full p-2"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`grid ${gridCols} gap-4 h-full`}>
          {/* Local User Video (Picture-in-Picture) */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-300 text-xl font-semibold">
                      {participants.find(p => p.isLocalUser)?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Camera off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              You {isAudioEnabled ? '' : '(muted)'}
            </div>
          </div>

          {/* Remote Participants */}
          {remoteParticipants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
              <RemoteVideoStream
                stream={remoteStreams.get(participant.id) || null}
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {participant.name} {participant.isAudioEnabled ? '' : '(muted)'}
              </div>
              {!participant.isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-300 text-xl font-semibold">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Camera off</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call Controls */}
      <div className="p-4 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <Button
            onClick={handleToggleAudio}
            variant={isAudioEnabled ? "primary" : "outline"}
            size="sm"
            className={`rounded-full p-3 ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white border-red-600'}`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            onClick={handleToggleVideo}
            variant={isVideoEnabled ? "primary" : "outline"}
            size="sm"
            className={`rounded-full p-3 ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white border-red-600'}`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={handleShareScreen}
            variant={isScreenSharing ? "primary" : "outline"}
            size="sm"
            className={`rounded-full p-3 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          {/* End Call */}
          <Button
            onClick={handleEndCall}
            variant="outline"
            size="sm"
            className="rounded-full p-4 bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute top-16 right-4 w-64 bg-gray-800 rounded-lg shadow-lg z-10">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium">Participants ({participants.length})</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3 p-3 hover:bg-gray-700">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    participant.isLocalUser ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <span className="text-white text-sm">
                      {participant.name.charAt(0)}
                    </span>
                  </div>
                  {participant.isLocalUser && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-gray-800 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{participant.name}</p>
                  <p className="text-gray-400 text-xs">
                    {participant.isLocalUser ? 'You' : 'Participant'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {!participant.isAudioEnabled && <MicOff className="w-4 h-4 text-red-400" />}
                  {!participant.isVideoEnabled && <VideoOff className="w-4 h-4 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Remote Video Stream Component
interface RemoteVideoStreamProps {
  stream: MediaStream | null;
}

const RemoteVideoStream: React.FC<RemoteVideoStreamProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

export default VideoCallInterface;