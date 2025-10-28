import React, { useState } from 'react';
import { Video, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import VideoCallInterface from './VideoCallInterface';
import { useVideoCall } from '../../hooks/useVideoCall';

interface VideoCallButtonProps {
  conversationId?: string;
  participants?: string[];
  className?: string;
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  conversationId,
  participants = [],
  className = ''
}) => {
  const [showCallInterface, setShowCallInterface] = useState(false);

  const {
    callState,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    shareScreen,
  } = useVideoCall({
    callId: conversationId,
  });

  const handleStartCall = async () => {
    try {
      await startCall(participants);
      setShowCallInterface(true);
    } catch (error) {
      console.error('Failed to start video call:', error);
      // Error is handled in the hook and displayed via callState.error
    }
  };


  const handleEndCall = () => {
    endCall();
    setShowCallInterface(false);
  };

  return (
    <>
      <Button
        onClick={handleStartCall}
        variant="ghost"
        size="sm"
        className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors ${className}`}
        disabled={!!callState.error}
      >
        <Video className="w-4 h-4" />
      </Button>

      {/* Error Display */}
      {callState.error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">{callState.error}</span>
        </div>
      )}

      {/* Video Call Interface */}
      {showCallInterface && callState.isCallActive && !callState.error && (
        <VideoCallInterface
          participants={[
            {
              id: 'local-user',
              name: 'You',
              isAudioEnabled: true,
              isVideoEnabled: true,
              isScreenSharing: false,
              isLocalUser: true,
            },
            ...callState.participants.map(p => ({
              ...p,
              isLocalUser: false,
            })),
          ]}
          localStream={callState.localStream}
          remoteStreams={callState.remoteStreams}
          isCallActive={callState.isCallActive}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onShareScreen={shareScreen}
          onEndCall={handleEndCall}
          className="z-50"
        />
      )}
    </>
  );
};

export default VideoCallButton;