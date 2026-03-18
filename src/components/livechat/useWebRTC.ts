import { useState, useRef, useCallback, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type CallType = 'audio' | 'video';

interface UseWebRTCProps {
  visitorId: string;
  adminId: string;
  from: 'visitor' | 'admin';
  eventSourceRef: React.RefObject<EventSource | null>;
}

export function useWebRTC({ visitorId, adminId, from, eventSourceRef }: UseWebRTCProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType>('audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<{ from: string; type: CallType } | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringtoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendSignal = useCallback(async (type: string, data?: any) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/call-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, adminId, type, data, from })
      });
    } catch (e) {
      console.error('Error sending signal:', e);
    }
  }, [visitorId, adminId, from]);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current);
      ringtoneTimeoutRef.current = null;
    }
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        setCallDuration(0);
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        endCall(false);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal]);

  const startCall = useCallback(async (type: CallType) => {
    try {
      setCallType(type);
      setCallStatus('calling');

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal('call-offer', { sdp: offer, callType: type });

      // Timeout after 30s
      ringtoneTimeoutRef.current = setTimeout(() => {
        if (callStatus === 'calling') {
          endCall(true);
        }
      }, 30000);
    } catch (e) {
      console.error('Error starting call:', e);
      setCallStatus('idle');
      cleanup();
    }
  }, [createPeerConnection, sendSignal, cleanup]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      setCallStatus('connected');
      setCallType(incomingCall.type);
      setIncomingCall(null);

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: incomingCall.type === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = pcRef.current;
      if (!pc) return;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal('call-answer', { sdp: answer });
    } catch (e) {
      console.error('Error accepting call:', e);
      endCall(true);
    }
  }, [incomingCall, sendSignal]);

  const rejectCall = useCallback(() => {
    setIncomingCall(null);
    sendSignal('call-rejected');
    cleanup();
    setCallStatus('idle');
  }, [sendSignal, cleanup]);

  const endCall = useCallback((notify = true) => {
    if (notify) {
      sendSignal('call-ended');
    }
    cleanup();
    setCallStatus('idle');
    setIncomingCall(null);
  }, [sendSignal, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Listen for call signals via SSE
  useEffect(() => {
    const es = eventSourceRef.current;
    if (!es) return;

    const handler = async (e: MessageEvent) => {
      try {
        const signal = JSON.parse(e.data);
        // Ignore own signals
        if (signal.from === from) return;
        if (signal.visitorId !== visitorId || signal.adminId !== adminId) return;

        switch (signal.type) {
          case 'call-offer': {
            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data.sdp));
            setIncomingCall({ from: signal.from, type: signal.data.callType || 'audio' });
            setCallStatus('ringing');
            break;
          }
          case 'call-answer': {
            const pc = pcRef.current;
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.data.sdp));
            }
            if (ringtoneTimeoutRef.current) {
              clearTimeout(ringtoneTimeoutRef.current);
              ringtoneTimeoutRef.current = null;
            }
            break;
          }
          case 'ice-candidate': {
            const pc = pcRef.current;
            if (pc && signal.data) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.data));
              } catch (err) {
                console.warn('Error adding ICE candidate:', err);
              }
            }
            break;
          }
          case 'call-ended': {
            cleanup();
            setCallStatus('idle');
            setIncomingCall(null);
            break;
          }
          case 'call-rejected': {
            cleanup();
            setCallStatus('idle');
            setIncomingCall(null);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling call signal:', err);
      }
    };

    es.addEventListener('call_signal', handler as EventListener);
    return () => {
      es.removeEventListener('call_signal', handler as EventListener);
    };
  }, [eventSourceRef.current, from, visitorId, adminId, createPeerConnection, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callStatus !== 'idle') {
        sendSignal('call-ended');
      }
      cleanup();
    };
  }, []);

  return {
    callStatus,
    callType,
    isMuted,
    isVideoOff,
    callDuration,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
