import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: LiveSession is not an exported member of '@google/genai'.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { RecordingEntry } from '../types';
import { generateTagsFromText } from '../services/geminiService';
import { RecordIcon, StopIcon, LoadingIcon } from './icons/Icons';

// Helper function from Gemini docs to encode audio bytes.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to create a Blob for the Live API
function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// FIX: Define the LiveSession interface locally as it is not exported from the library.
interface LiveSession {
    close(): void;
    sendRealtimeInput(input: { media: Blob }): void;
}


interface RecorderProps {
  onAddEntry: (newEntry: Omit<RecordingEntry, 'id' | 'createdAt'>) => void;
}

export const Recorder: React.FC<RecorderProps> = ({ onAddEntry }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const transcriptRef = useRef('');

  const stopRecordingResources = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    if (!process.env.API_KEY) {
      alert("کلید Gemini API تنظیم نشده است.\n\nبرای فعال‌سازی قابلیت تبدیل صدا به متن و تگ‌گذاری خودکار، لطفاً کلید API خود را در تنظیمات Vercel به عنوان یک متغیر محیطی (Environment Variable) به نام API_KEY اضافه کنید.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setTranscript('');
      transcriptRef.current = '';
      setElapsedTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => console.log("Live session opened."),
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              transcriptRef.current += text;
              setTranscript(transcriptRef.current);
            }
             if (message.serverContent?.turnComplete) {
                // To provide a smoother user experience, we stream the text as it arrives.
                // The final text is handled on stop.
             }
          },
          onerror: (e: ErrorEvent) => console.error("Live session error:", e),
          onclose: (e: CloseEvent) => console.log("Live session closed."),
        },
        config: {
          responseModalities: [Modality.AUDIO], // Fix: This is required for audio models.
          inputAudioTranscription: {},
        },
      });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
          }
      };

      mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(audioContextRef.current.destination);

    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("دسترسی به میکروفون امکان‌پذیر نیست. لطفاً دسترسی را فعال کنید.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    stopRecordingResources();

    const finalTranscript = transcriptRef.current;
    const finalDuration = elapsedTime;

    if (finalTranscript.trim().length > 0) {
      const tags = await generateTagsFromText(finalTranscript);
      onAddEntry({
        duration: finalDuration,
        transcript: finalTranscript,
        tags: tags,
      });
    }

    setTranscript('');
    transcriptRef.current = '';
    setElapsedTime(0);
    setIsProcessing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingResources();
    };
  }, [stopRecordingResources]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
      <div className="flex flex-col items-center">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20 flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
            aria-label="شروع ضبط"
          >
            <RecordIcon />
          </button>
        )}
        {(isRecording || isProcessing) && (
           <button
            onClick={stopRecording}
            disabled={isProcessing}
            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-20 h-20 flex items-center justify-center transition-all duration-200 ease-in-out shadow-lg animate-pulse disabled:animate-none disabled:bg-gray-600"
            aria-label="پایان ضبط"
          >
           {isProcessing ? <LoadingIcon /> : <StopIcon />}
          </button>
        )}

        <div className="mt-4 text-center">
          <p className="text-2xl font-mono tracking-widest text-gray-300">{formatTime(elapsedTime)}</p>
          <p className="text-sm text-gray-400 mt-1">
             {isRecording ? "در حال ضبط..." : isProcessing ? "در حال پردازش..." : "برای شروع، دکمه را فشار دهید"}
          </p>
        </div>
      </div>
      {(isRecording || isProcessing) && transcript && (
        <div className="mt-6 bg-gray-900/50 p-4 rounded-lg max-h-32 overflow-y-auto">
            <p className="text-gray-300 leading-relaxed">{transcript}</p>
        </div>
      )}
    </div>
  );
};