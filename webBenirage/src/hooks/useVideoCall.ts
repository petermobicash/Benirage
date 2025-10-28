import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseVideoCallOptions {
  callId?: string;
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

interface SignalingMessage {
  type: string;
  targetId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface VideoCallState {
  isCallActive: boolean;
  isConnecting: boolean;
  callId: string | null;
  participants: CallParticipant[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  error: string | null;
}

export const useVideoCall = (options: UseVideoCallOptions = {}) => {
  const { callId: initialCallId } = options;

  const [callState, setCallState] = useState<VideoCallState>({
    isCallActive: false,
    isConnecting: false,
    callId: initialCallId || null,
    participants: [],
    localStream: null,
    remoteStreams: new Map(),
    error: null,
  });

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalingChannelRef = useRef<RealtimeChannel | null>(null);

  // Generate a unique call ID
  const generateCallId = useCallback(() => {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Check if media devices are supported and context is secure
  const checkMediaSupport = useCallback(async () => {
    if (!window.isSecureContext) {
      throw new Error('Media devices require a secure context (HTTPS). Please ensure your site is served over HTTPS.');
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media devices are not supported in this browser.');
    }

    // Check permissions for camera and microphone
    try {
      const [cameraPermission, micPermission] = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
      ]);

      if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
        throw new Error('Camera or microphone permissions are denied. Please enable them in your browser settings and reload the page.');
      }
    } catch (permError) {
      // Permissions API might not be supported, proceed anyway
      console.warn('Permissions API not supported:', permError);
    }
  }, []);

  // Initialize media devices
  const initializeMediaDevices = useCallback(async (constraints: MediaStreamConstraints = {
    audio: true,
    video: true
  }) => {
    try {
      // Check support and permissions first
      await checkMediaSupport();

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      setCallState(prev => ({
        ...prev,
        localStream: stream,
      }));

      return stream;
    } catch (error: unknown) {
      console.error('Error accessing media devices:', error);
      const err = error as Error;

      let errorMessage = 'Failed to access camera/microphone. ';

      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone access in your browser.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use by another application.';
      } else if (err.message.includes('secure context')) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please check your browser settings and try again.';
      }

      setCallState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [checkMediaSupport]);

  // Create peer connection
  const createPeerConnection = useCallback((participantId: string): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers in production
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via signaling
        signalingChannelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'ice_candidate',
            candidate: event.candidate,
            targetId: participantId,
          },
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      setCallState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams.set(participantId, remoteStream)),
      }));
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${participantId}:`, peerConnection.connectionState);

      if (peerConnection.connectionState === 'connected') {
        setCallState(prev => ({
          ...prev,
          isConnecting: false,
        }));
      } else if (peerConnection.connectionState === 'failed') {
        setCallState(prev => ({
          ...prev,
          error: `Connection failed for participant ${participantId}`,
        }));
      }
    };

    return peerConnection;
  }, []);

  // Create answer
  const createAnswer = useCallback(async (participantId: string, offer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnectionsRef.current.get(participantId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer via signaling
      signalingChannelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'answer',
          answer,
          targetId: participantId,
        },
      });
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  }, []);

  // Create offer
  const createOffer = useCallback(async (participantId: string, peerConnection: RTCPeerConnection) => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer via signaling
      signalingChannelRef.current?.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'offer',
          offer,
          targetId: participantId,
        },
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, []);

  // Handle signaling messages
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    const { type, targetId, ...data } = message;

    switch (type) {
      case 'offer': {
        if (data.offer) {
          await createAnswer(targetId, data.offer);
        }
        break;
      }

      case 'answer': {
        const peerConnection = peerConnectionsRef.current.get(targetId);
        if (peerConnection && data.answer) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
        break;
      }

      case 'ice_candidate': {
        const pc = peerConnectionsRef.current.get(targetId);
        if (pc && data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;
      }

      case 'participant_joined': {
        // Handle new participant
        const newPeerConnection = createPeerConnection(targetId);
        peerConnectionsRef.current.set(targetId, newPeerConnection);

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            newPeerConnection.addTrack(track, localStreamRef.current!);
          });
        }

        createOffer(targetId, newPeerConnection);
        break;
      }

      case 'participant_left': {
        // Handle participant leaving
        const leavingPeerConnection = peerConnectionsRef.current.get(targetId);
        if (leavingPeerConnection) {
          leavingPeerConnection.close();
          peerConnectionsRef.current.delete(targetId);
        }

        setCallState(prev => {
          const newRemoteStreams = new Map(prev.remoteStreams);
          newRemoteStreams.delete(targetId);

          return {
            ...prev,
            remoteStreams: newRemoteStreams,
            participants: prev.participants.filter(p => p.id !== targetId),
          };
        });
        break;
      }
    }
  }, [createPeerConnection, createAnswer, createOffer]);

  // Set up signaling channel
  const setupSignaling = useCallback((callId: string) => {
    signalingChannelRef.current = supabase.channel(`video_call_${callId}`);

    signalingChannelRef.current
      .on('broadcast', { event: 'signal' }, ({ payload }: { payload: SignalingMessage }) => {
        handleSignalingMessage(payload);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to video call signaling');
        }
      });
  }, [handleSignalingMessage]);


  // Start video call
  const startCall = useCallback(async (participants: string[] = []) => {
    try {
      setCallState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      // Initialize local media
      const stream = await initializeMediaDevices();

      // Generate call ID if not provided
      const callId = initialCallId || generateCallId();

      setCallState(prev => ({
        ...prev,
        callId,
        isCallActive: true,
      }));

      // Set up signaling channel
      setupSignaling(callId);

      // Create peer connections for each participant
      participants.forEach(participantId => {
        const peerConnection = createPeerConnection(participantId);
        peerConnectionsRef.current.set(participantId, peerConnection);

        // Add local stream tracks
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Create and send offer
        createOffer(participantId, peerConnection);
      });

    } catch (error) {
      console.error('Error starting call:', error);
      setCallState(prev => ({
        ...prev,
        error: 'Failed to start video call',
        isConnecting: false,
      }));
    }
  }, [initialCallId, generateCallId, initializeMediaDevices, createPeerConnection, createOffer, setupSignaling]);

  // Join existing call
  const joinCall = useCallback(async (callId: string) => {
    try {
      setCallState(prev => ({
        ...prev,
        isConnecting: true,
        callId,
        error: null,
      }));

      // Initialize local media
      const stream = await initializeMediaDevices();

      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        localStream: stream,
      }));

      // Set up signaling channel
      setupSignaling(callId);

    } catch (error) {
      console.error('Error joining call:', error);
      setCallState(prev => ({
        ...prev,
        error: 'Failed to join video call',
        isConnecting: false,
      }));
    }
  }, [initializeMediaDevices, setupSignaling]);

  // End call
  const endCall = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach(peerConnection => {
      peerConnection.close();
    });
    peerConnectionsRef.current.clear();

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clean up signaling
    if (signalingChannelRef.current) {
      supabase.removeChannel(signalingChannelRef.current);
      signalingChannelRef.current = null;
    }

    setCallState({
      isCallActive: false,
      isConnecting: false,
      callId: null,
      participants: [],
      localStream: null,
      remoteStreams: new Map(),
      error: null,
    });
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;

        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p =>
            p.isLocalUser ? { ...p, isAudioEnabled: audioTrack.enabled } : p
          ),
        }));
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;

        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(p =>
            p.isLocalUser ? { ...p, isVideoEnabled: videoTrack.enabled } : p
          ),
        }));
      }
    }
  }, []);

  // Share screen
  const shareScreen = useCallback(async () => {
    try {
      // Check support and permissions first
      await checkMediaSupport();

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      if (localStreamRef.current) {
        // Replace video track with screen share track
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach(pc => {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          }
        });

        // Update local stream
        const newStream = new MediaStream([
          ...screenStream.getTracks(),
          ...localStreamRef.current.getAudioTracks(),
        ]);

        localStreamRef.current = newStream;

        setCallState(prev => ({
          ...prev,
          localStream: newStream,
          participants: prev.participants.map(p =>
            p.isLocalUser ? { ...p, isScreenSharing: true } : p
          ),
        }));

        // Handle screen share end
        videoTrack.onended = () => {
          // Stop screen sharing and restore camera
          if (localStreamRef.current) {
            // Restore original video track
            const originalStream = localStreamRef.current;
            const videoTrack = originalStream.getVideoTracks()[0];
            if (videoTrack) {
              peerConnectionsRef.current.forEach(pc => {
                const senders = pc.getSenders();
                const videoSender = senders.find(s => s.track?.kind === 'video');
                if (videoSender) {
                  videoSender.replaceTrack(videoTrack);
                }
              });

              setCallState(prev => ({
                ...prev,
                participants: prev.participants.map(p =>
                  p.isLocalUser ? { ...p, isScreenSharing: false } : p
                ),
              }));
            }
          }
        };
      }
    } catch (error: unknown) {
      console.error('Error sharing screen:', error);
      const err = error as Error;

      let errorMessage = 'Failed to share screen. ';

      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow screen sharing access in your browser.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'Screen sharing is not supported or no screen available.';
      } else {
        errorMessage += 'Please check your browser settings and try again.';
      }

      setCallState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [checkMediaSupport]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    callState,
    startCall,
    joinCall,
    endCall,
    toggleAudio,
    toggleVideo,
    shareScreen,
  };
};