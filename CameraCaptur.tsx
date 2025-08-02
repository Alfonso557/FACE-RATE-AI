import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon } from './Icons';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Errore nell'accesso alla fotocamera:", err);
        alert("Impossibile accedere alla fotocamera. Assicurati di aver dato i permessi.");
        onCancel();
      }
    };

    enableCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCancel]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 p-4">
      <div className="w-full aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-indigo-500/50">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Annulla
        </button>
        <button
          onClick={capturePhoto}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 animate-pulse"
        >
          <CameraIcon className="w-6 h-6" />
          <span>Analizza Foto</span>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;

