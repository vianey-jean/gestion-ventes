import { useState, useRef, useCallback, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
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
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringtoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Use refs to avoid stale closures
  const callStatusRef = useRef<CallStatus>('idle');
  const callTypeRef = useRef<CallType>('audio');
  const visitorIdRef = useRef(visitorId);
  const adminIdRef = useRef(adminId);
  
  // Keep refs in sync
  useEffect(() => { visitorIdRef.current = visitorId; }, [visitorId]);
  useEffect(() => { adminIdRef.current = adminId; }, [adminId]);
  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);
  useEffect(() => { callTypeRef.current = callType; }, [callType]);

  // Pending ICE candidates queue (for candidates arriving before remote description)
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const sendSignal = useCallback(async (type: string, data?: any) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/call-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: visitorIdRef.current,
          adminId: adminIdRef.current,
          type,
          data,
          from
        })
      });
    } catch (e) {
      console.error('Error sending signal:', e);
    }
  }, [from]);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current);
      ringtoneTimeoutRef.current = null;
    }
    pendingCandidatesRef.current = [];
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  }, []);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const attachStream = useCallback((stream: MediaStream) => {
    remoteStreamRef.current = stream;
    // For video calls, attach to video element
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play().catch(() => {});
    }
    // Always attach to audio element as fallback
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }
    
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack fired, streams:', event.streams.length);
      if (event.streams && event.streams[0]) {
        attachStream(event.streams[0]);
      } else {
        // Fallback: create stream from track
        const stream = new MediaStream([event.track]);
        attachStream(stream);
      }
    };

    // Use iceconnectionstate for broader browser support
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        if (callStatusRef.current !== 'connected') {
          setCallStatus('connected');
          startDurationTimer();
        }
      }
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        // Small delay to allow reconnection
        setTimeout(() => {
          if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
            sendSignal('call-ended');
            cleanup();
            setCallStatus('idle');
            setIncomingCall(null);
          }
        }, 3000);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal, attachStream, cleanup, startDurationTimer]);

  const getMediaStream = useCallback(async (type: CallType): Promise<MediaStream> => {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: type === 'video' ? {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } : false
    };
    
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      // Fallback: try audio only if video fails
      if (type === 'video') {
        console.warn('[WebRTC] Video failed, trying audio only:', e);
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      throw e;
    }
  }, []);

  const startCall = useCallback(async (type: CallType) => {
    try {
      setCallType(type);
      callTypeRef.current = type;
      setCallStatus('calling');

      const stream = await getMediaStream(type);
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video',
      });
      await pc.setLocalDescription(offer);
      await sendSignal('call-offer', { sdp: offer, callType: type });

      // Timeout after 30s
      ringtoneTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === 'calling') {
          sendSignal('call-ended');
          cleanup();
          setCallStatus('idle');
          setIncomingCall(null);
        }
      }, 30000);
    } catch (e) {
      console.error('[WebRTC] Error starting call:', e);
      setCallStatus('idle');
      cleanup();
    }
  }, [createPeerConnection, sendSignal, cleanup, getMediaStream]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      const type = incomingCall.type;
      setCallType(type);
      callTypeRef.current = type;
      setIncomingCall(null);

      const stream = await getMediaStream(type);
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      const pc = pcRef.current;
      if (!pc) {
        console.error('[WebRTC] No peer connection when accepting');
        return;
      }

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal('call-answer', { sdp: answer });
      
      // Set status to connected immediately - audio/video will flow once ICE connects
      setCallStatus('connected');
      startDurationTimer();

      // Flush pending ICE candidates
      for (const candidate of pendingCandidatesRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error adding queued ICE candidate:', err);
        }
      }
      pendingCandidatesRef.current = [];
    } catch (e) {
      console.error('[WebRTC] Error accepting call:', e);
      sendSignal('call-ended');
      cleanup();
      setCallStatus('idle');
    }
  }, [incomingCall, sendSignal, cleanup, getMediaStream, startDurationTimer]);

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

  // Listen for call signals via SSE - use interval to check ref
  useEffect(() => {
    let currentEs: EventSource | null = null;
    
    const handler = async (e: MessageEvent) => {
      try {
        const signal = JSON.parse(e.data);
        // Ignore own signals
        if (signal.from === from) return;
        
        // Match conversation - for admin, visitorId might change based on selected conv
        const myVisitorId = visitorIdRef.current;
        const myAdminId = adminIdRef.current;
        if (!myVisitorId || !myAdminId) return;
        if (signal.visitorId !== myVisitorId || signal.adminId !== myAdminId) return;

        console.log('[WebRTC] Received signal:', signal.type, 'from:', signal.from);

        switch (signal.type) {
          case 'call-offer': {
            // Someone is calling us
            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data.sdp));
            setIncomingCall({ from: signal.from, type: signal.data.callType || 'audio' });
            setCallStatus('ringing');
            break;
          }
          case 'call-answer': {
            // Our call was answered
            const pc = pcRef.current;
            if (pc) {
              console.log('[WebRTC] Setting remote description from answer');
              await pc.setRemoteDescription(new RTCSessionDescription(signal.data.sdp));
              
              // Clear ringing timeout
              if (ringtoneTimeoutRef.current) {
                clearTimeout(ringtoneTimeoutRef.current);
                ringtoneTimeoutRef.current = null;
              }
              
              // Set connected - the other side already answered
              setCallStatus('connected');
              startDurationTimer();

              // Flush pending ICE candidates
              for (const candidate of pendingCandidatesRef.current) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                  console.warn('[WebRTC] Error adding queued ICE candidate:', err);
                }
              }
              pendingCandidatesRef.current = [];
            }
            break;
          }
          case 'ice-candidate': {
            const pc = pcRef.current;
            if (pc && signal.data) {
              // If remote description not yet set, queue the candidate
              if (!pc.remoteDescription || !pc.remoteDescription.type) {
                console.log('[WebRTC] Queuing ICE candidate (no remote desc yet)');
                pendingCandidatesRef.current.push(signal.data);
              } else {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(signal.data));
                } catch (err) {
                  console.warn('[WebRTC] Error adding ICE candidate:', err);
                }
              }
            } else if (signal.data) {
              // No PC yet, queue it
              pendingCandidatesRef.current.push(signal.data);
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
        console.error('[WebRTC] Error handling call signal:', err);
      }
    };

    // Attach/reattach listener when EventSource changes
    const checkAndAttach = () => {
      const es = eventSourceRef.current;
      if (es && es !== currentEs) {
        if (currentEs) {
          currentEs.removeEventListener('call_signal', handler as EventListener);
        }
        currentEs = es;
        es.addEventListener('call_signal', handler as EventListener);
      }
    };

    checkAndAttach();
    // Poll for EventSource changes (it may be set after mount)
    const pollInterval = setInterval(checkAndAttach, 500);

    return () => {
      clearInterval(pollInterval);
      if (currentEs) {
        currentEs.removeEventListener('call_signal', handler as EventListener);
      }
    };
  }, [from, createPeerConnection, cleanup, startDurationTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callStatusRef.current !== 'idle') {
        sendSignal('call-ended');
      }
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    remoteAudioRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
