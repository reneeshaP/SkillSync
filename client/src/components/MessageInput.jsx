import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Paperclip, Mic, Camera, Square } from 'lucide-react';
import CameraCapture from './CameraCapture';

const MAX_ATTACHMENT_MB = 20;

export const MessageInput = ({ onSendMessage, onTyping, onSendAttachment }) => {
  const [message, setMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      alert(`File is too large — max ${MAX_ATTACHMENT_MB}MB`);
      return;
    }
    onSendAttachment(file);
  };

  const handleCameraCapture = (file) => {
    setShowCamera(false);
    onSendAttachment(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        onSendAttachment(file);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordTimerRef.current);
    setIsRecording(false);
  };

  const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="p-4 border-t border-slate-700">
      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelected}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-slate-600 p-2 rounded-full transition-colors"
            title="Attach file"
          >
            <Paperclip className="text-slate-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </button>
        </div>

        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 bg-slate-700 border border-red-500 rounded-lg py-2 px-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm">Recording... {formatSeconds(recordSeconds)}</span>
            <button
              type="button"
              onClick={stopRecording}
              className="ml-auto text-red-400 hover:text-red-300"
              title="Stop and send"
            >
              <Square size={18} />
            </button>
          </div>
        ) : (
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Type something..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder:text-slate-400 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="hover:bg-slate-600 p-2 rounded-full transition-colors"
                title="Send photo"
              >
                <Camera className="text-slate-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="hover:bg-slate-600 p-2 rounded-full transition-colors"
                title="Voice message"
              >
                <Mic className="text-slate-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onTyping: PropTypes.func,
  onSendAttachment: PropTypes.func.isRequired
};

export default MessageInput;
