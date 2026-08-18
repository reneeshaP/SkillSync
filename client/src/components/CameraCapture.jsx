import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { X, Camera as CameraIcon } from 'lucide-react';

export const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Could not access camera: ' + err.message);
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-4 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Take a photo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {error ? (
          <p className="text-red-400 text-sm p-4">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-full p-4 transition-colors"
            title="Capture"
          >
            <CameraIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

CameraCapture.propTypes = {
  onCapture: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CameraCapture;
