import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  currentValue?: string;
  className?: string;
  id?: string;
}

const LANG_CODE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  te: 'te-IN',
  sa: 'hi-IN',
  hinglish: 'hi-IN'
};

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  currentValue = '',
  className = '',
  id = 'voice-input-btn'
}) => {
  const { language } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleToggleVoice = () => {
    setErrorMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Voice input is not supported in this browser. You can type your query instead.'
      );
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = LANG_CODE_MAP[language] || 'en-IN';

      let interimTranscript = '';
      let finalTranscript = '';
      const baseText = currentValue ? currentValue.trim() + ' ' : '';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const combined = (baseText + (finalTranscript || interimTranscript)).trim();
        if (combined) {
          onTranscript(combined);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage('Microphone permission is required for voice input.');
        } else if (event.error === 'no-speech') {
          // No speech detected, ignore silently or reset
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Voice recognition error: ${event.error}. Please retry.`);
        }
        setTimeout(() => setErrorMessage(null), 6000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage('Could not initiate microphone. Please type your query.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className={`voice-input-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
      <button
        type="button"
        id={id}
        onClick={handleToggleVoice}
        className={`btn-icon voice-mic-btn ${isListening ? 'listening active' : ''}`}
        title={isListening ? 'Stop listening' : 'Speak your query in your selected language'}
        aria-label={isListening ? 'Stop microphone' : 'Start microphone voice input'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          padding: '8px',
          borderRadius: '8px',
          border: isListening ? '1.5px solid #ef4444' : '1px solid #d1d5db',
          background: isListening ? '#fef2f2' : '#ffffff',
          color: isListening ? '#dc2626' : '#4b5563',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isListening ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : 'none'
        }}
      >
        {isListening ? (
          <Mic size={18} style={{ color: '#dc2626', animation: 'pulse 1.2s infinite ease-in-out' }} />
        ) : (
          <Mic size={18} />
        )}
      </button>

      {errorMessage && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            marginBottom: '6px',
            zIndex: 50,
            background: '#ffffff',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '0.78rem',
            color: '#b91c1c',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
