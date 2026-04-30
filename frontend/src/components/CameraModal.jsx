import { useRef, useEffect, useState } from "react";

// Inline styles for CameraModal
const cameraStyles = `
.camera-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.camera-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(245, 158, 11, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.camera-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.camera-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #f5a60b;
  letter-spacing: 0.5px;
}

.camera-close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.camera-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.camera-modal-body {
  background: #000;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.camera-error {
  padding: 40px 20px;
  text-align: center;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  margin: 20px;
}

.camera-error p {
  margin: 10px 0;
  font-size: 14px;
}

.camera-error-hint {
  color: #999;
  font-size: 12px;
}

.camera-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(245, 158, 11, 0.1);
  flex-wrap: wrap;
}

.camera-toggle-btn,
.camera-capture-btn,
.camera-cancel-btn {
  flex: 1;
  min-width: 100px;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.3px;
}

.camera-capture-btn {
  background: linear-gradient(135deg, #f5a60b 0%, #f59e0b 100%);
  color: #000;
  font-weight: 700;
  flex: 1.5;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.camera-capture-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.camera-capture-btn:active:not(:disabled) {
  transform: translateY(0);
}

.camera-toggle-btn {
  background: rgba(245, 158, 11, 0.15);
  color: #f5a60b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.camera-toggle-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  border-color: rgba(245, 158, 11, 0.5);
}

.camera-cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #bbb;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.camera-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

@media (max-width: 600px) {
  .camera-modal {
    width: 95%;
    max-width: 100%;
    max-height: 90vh;
  }
  .camera-modal-body {
    min-height: 300px;
  }
  .camera-modal-footer {
    flex-direction: column;
  }
  .camera-toggle-btn,
  .camera-capture-btn,
  .camera-cancel-btn {
    width: 100%;
    min-width: unset;
  }
  .camera-capture-btn {
    flex: unset;
  }
}
`;

export default function CameraModal({ isOpen, onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" for back camera, "user" for front

  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraReady(true);
      } catch (err) {
        setError(err.message || "Could not access camera. Please check permissions.");
        setIsCameraReady(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        onCapture(file);
      }
    }, "image/jpeg", 0.95);

    handleClose();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCameraReady(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{cameraStyles}</style>
      <div className="camera-modal-overlay">
      <div className="camera-modal">
        <div className="camera-modal-header">
          <h3>Capture Photo</h3>
          <button className="camera-close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="camera-modal-body">
          {error ? (
            <div className="camera-error">
              <p>⚠️ {error}</p>
              <p className="camera-error-hint">Make sure to grant camera permissions in your browser settings.</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </>
          )}
        </div>

        <div className="camera-modal-footer">
          {isCameraReady && (
            <button className="camera-toggle-btn" onClick={toggleCamera}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 19H5c-1 0-2-.9-2-2V7c0-1.1.9-2 2-2h4M15 13l4-4m0 0l4 4m-4-4v12"/>
              </svg>
              Switch Camera
            </button>
          )}
          <button className="camera-cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          {isCameraReady && (
            <button className="camera-capture-btn" onClick={capturePhoto}>
              📸 Capture Photo
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
