
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GeneratedEmailContent, TranscriptEntry } from '../types';
import { Icon } from './Icon';

interface VoiceComposerProps {
  onEmailGenerated: (content: GeneratedEmailContent) => void;
}

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const submitEmailFunctionDeclaration: FunctionDeclaration = {
  name: 'submitEmail',
  parameters: {
    type: Type.OBJECT,
    description: 'Submits the final generated email content once the user has approved it.',
    properties: {
      subject: {
        type: Type.STRING,
        description: 'The final subject line of the email.',
      },
      body: {
        type: Type.STRING,
        description: 'The final, complete body of the email.',
      },
    },
    required: ['subject', 'body'],
  },
};

export const VoiceComposer: React.FC<VoiceComposerProps> = ({ onEmailGenerated }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [statusMessage, setStatusMessage] = useState('Click start to begin the conversation.');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsRecording(false);
        setStatusMessage('Conversation ended. Click start to begin again.');
    }, []);

    const startConversation = async () => {
        setIsRecording(true);
        setError(null);
        setTranscript([]);
        setStatusMessage('Connecting to the AI...');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // FIX: Cast window to `any` to allow for `webkitAudioContext` for cross-browser compatibility.
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            
            // FIX: Cast window to `any` to allow for `webkitAudioContext` for cross-browser compatibility.
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();
            
            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatusMessage('Listening... Speak now.');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscription.trim();
                            const fullOutput = currentOutputTranscription.trim();
                            if (fullInput) setTranscript(prev => [...prev, { speaker: 'user', text: fullInput }]);
                            if (fullOutput) setTranscript(prev => [...prev, { speaker: 'model', text: fullOutput }]);
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        
                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'submitEmail') {
                                    onEmailGenerated({ subject: fc.args.subject, body: fc.args.body });
                                    stopConversation();
                                }
                            }
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => sources.delete(source));
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                        
                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                    },
                    onerror: (e) => {
                        console.error('Live API Error:', e);
                        setError('An error occurred during the conversation.');
                        stopConversation();
                    },
                    onclose: () => {
                        // This may be called on purpose, so don't show an error
                        console.log('Live API connection closed.');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    tools: [{ functionDeclarations: [submitEmailFunctionDeclaration] }],
                    systemInstruction: "You are a helpful AI assistant for drafting emails. Your goal is to have a natural conversation with the user to understand what kind of email they need. Ask clarifying questions if necessary. Once you have all the details (recipient, purpose, tone, key points), use the 'submitEmail' function to provide the final subject and body of the email. Do not use the function until you are confident the email is complete and the user has confirmed it."
                },
            });
        } catch (err) {
            console.error(err);
            setError('Failed to start microphone. Please grant permission and try again.');
            setIsRecording(false);
            setStatusMessage('Could not start. Check microphone permissions.');
        }
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] flex flex-col">
            <div className="flex-grow mb-4 h-96 overflow-y-auto pr-2">
                <div className="space-y-4">
                    {transcript.map((entry, index) => (
                        <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${entry.speaker === 'user' ? 'bg-blue-100 dark:bg-blue-900/50 text-slate-800 dark:text-slate-200' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
                                <p className="text-sm">{entry.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0 text-center space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{statusMessage}</p>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                    onClick={isRecording ? stopConversation : startConversation}
                    className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                >
                    {isRecording ? (
                        <>
                            <Icon name="stop" className="h-5 w-5" />
                            Stop Conversation
                        </>
                    ) : (
                        <>
                            <Icon name="microphone" className="h-5 w-5" />
                            Start Conversation
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
