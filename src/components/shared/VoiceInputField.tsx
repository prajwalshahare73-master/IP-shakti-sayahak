import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, Volume2, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface VoiceInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  id?: string;
  label?: string;
}

export const VoiceInputField: React.FC<VoiceInputProps> = ({
  value,
  onChange,
  placeholder = 'Type or speak your question in Hindi, English, or any Indian language...',
  className = '',
  multiline = false,
  rows = 3,
  id = 'voice-input-field',
  label
}) => {
  const { language } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [showVoicePrompts, setShowVoicePrompts] = useState(false);

  const recognitionRef = useRef<any>(null);
  const baseValueRef = useRef<string>(value);
  const onChangeRef = useRef(onChange);

  // Keep latest onChange in ref without triggering re-initialization
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sample voice prompts for testing / fast input across languages
  const sampleVoicePrompts: Record<string, string[]> = {
    hi: [
      'क्या मेरी आयुर्वेदिक हर्बल कफ सिरप का पेटेंट संभव है?',
      'जैविक संसाधनों के लिए स्टेट बायोडायवर्सिटी बोर्ड से अनुमति कैसे लें?',
      'आयुर्वेद ब्रांड नाम के लिए ट्रेडमार्क क्लास 5 में कैसे रजिस्टर करें?'
    ],
    en: [
      'Is my polyherbal respiratory kadha formulation patentable in India?',
      'Do I need NBA Form III prior approval for exporting biological extracts?',
      'How does Section 3(p) apply to classical Ayurvedic text references?'
    ],
    sa: [
      'किं मम आयुर्वेद-योगस्य पेटेंट-स्वीकृतिः सम्भवा?',
      'जैविकसंसाधनेभ्यः ABS-अनुपालनम् आवश्यकं किम्?'
    ],
    gu: [
      'શું મારું આયુર્વેદિક ફોર્મ્યુલેશન પેટન્ટેબલ છે?',
      'જૈવિક સંસાધનો માટે બાયોડાયવર્સિટી બોર્ડની મંજૂરી કેવી રીતે લેવી?'
    ],
    te: [
      'నా ఆయుర్వేద ఫార్ములేషన్‌కు పేటెంట్ లభిస్తుందా?',
      'జీవ వనరులకు ABS అనుమతి అవసరమా?'
    ]
  };

  const currentPrompts = sampleVoicePrompts[language] || sampleVoicePrompts['en'];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Map language
      let langCode = 'en-IN';
      if (language === 'hi' || language === 'hinglish') langCode = 'hi-IN';
      else if (language === 'gu') langCode = 'gu-IN';
      else if (language === 'te') langCode = 'te-IN';
      else if (language === 'kn') langCode = 'kn-IN';
      else if (language === 'mr') langCode = 'mr-IN';
      else if (language === 'bn') langCode = 'bn-IN';
      else if (language === 'sa') langCode = 'hi-IN';

      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscripts = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscripts += transcript + ' ';
          } else {
            currentInterim += transcript;
          }
        }

        setInterimText(currentInterim);

        if (finalTranscripts) {
          const prefix = baseValueRef.current ? baseValueRef.current.trim() + ' ' : '';
          const newTotal = prefix + finalTranscripts.trim();
          baseValueRef.current = newTotal;
          onChangeRef.current(newTotal);
          setInterimText('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition event error:', event.error);
        if (event.error === 'no-speech') {
          // Ignore no-speech silently, keep waiting
          return;
        }
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked. Please enable microphone permissions in your browser URL bar.');
        } else if (event.error === 'network') {
          setVoiceError('Speech recognition network error. Try sample voice prompts or type manually.');
        } else {
          setVoiceError(`Voice notice (${event.error}). You can continue speaking or click sample voice queries.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup error:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!speechSupported) {
      setVoiceError('Web Speech API is not enabled in this browser. Use voice sample prompts below or type.');
      setShowVoicePrompts(true);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      setVoiceError(null);
      baseValueRef.current = value; // Freeze current text before speaking
      try {
        recognitionRef.current?.start();
      } catch (err) {
        // If already started, stop then restart
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (_) {}
      }
    }
  };

  const handleApplySamplePrompt = (promptText: string) => {
    const prefix = value ? value.trim() + ' ' : '';
    const updated = prefix + promptText;
    baseValueRef.current = updated;
    onChange(updated);
    setShowVoicePrompts(false);
  };

  return (
    <div className={`voice-input-container ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {label && (
          <label htmlFor={id} className="gov-input-label mb-0">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowVoicePrompts(!showVoicePrompts)}
          className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
          title="Show sample voice inputs"
        >
          <Volume2 size={13} />
          <span>{showVoicePrompts ? 'Hide Voice Prompts' : 'Voice Query Prompts'}</span>
        </button>
      </div>

      <div className="voice-input-wrapper">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => {
              baseValueRef.current = e.target.value;
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            rows={rows}
            className={`gov-textarea ${isListening ? 'listening-border' : ''}`}
          />
        ) : (
          <input
            type="text"
            id={id}
            value={value}
            onChange={(e) => {
              baseValueRef.current = e.target.value;
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className={`gov-input ${isListening ? 'listening-border' : ''}`}
          />
        )}

        <button
          type="button"
          onClick={toggleListening}
          className={`voice-mic-btn ${isListening ? 'active-listening' : ''}`}
          title={isListening ? 'Click to finish speaking' : 'Click to speak in Hindi/English'}
          aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
        >
          {isListening ? (
            <>
              <span className="pulse-ring"></span>
              <MicOff size={18} className="icon-pulse" />
            </>
          ) : (
            <Mic size={18} />
          )}
        </button>
      </div>

      {/* Live Interim Transcript Feedback */}
      {isListening && (
        <div className="voice-status listening" role="status">
          <Loader2 size={14} className="spin-icon text-error" />
          <span>Listening... {interimText ? `"${interimText}"` : 'Speak now in Hindi, English, or selected language'}</span>
        </div>
      )}

      {/* Voice Prompts Quick Tray */}
      {showVoicePrompts && (
        <div className="voice-prompts-tray gov-card mt-2 p-3 bg-surface border">
          <div className="flex items-center gap-1 text-xs font-bold text-muted mb-2 uppercase">
            <Volume2 size={12} className="text-primary" />
            <span>Click to insert sample spoken query ({language.toUpperCase()}):</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {currentPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySamplePrompt(p)}
                className="text-left text-xs bg-white hover:bg-primary-light p-2 rounded border border-gray-200 transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      )}

      {voiceError && (
        <div className="voice-status error" role="alert">
          <AlertCircle size={14} />
          <span>{voiceError}</span>
        </div>
      )}
    </div>
  );
};
