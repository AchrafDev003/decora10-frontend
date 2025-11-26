import { useState, useRef } from "react";

export default function ImageMagnifier({ src, alt, zoom = 2, magnifierSize = 150 }) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    const { top, left, width, height } = imgRef.current.getBoundingClientRect();
    const xPos = e.clientX - left;
    const yPos = e.clientY - top;

    if (xPos < 0 || yPos < 0 || xPos > width || yPos > height) {
      setShowMagnifier(false);
      return;
    }

    setShowMagnifier(true);
    setX(xPos);
    setY(yPos);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block", width: "100%", maxHeight: "500px" }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowMagnifier(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setShowMagnifier(false)}
      />

      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierSize}px`,
            width: `${magnifierSize}px`,
            borderRadius: "50%",
            border: "3px solid rgba(0,0,0,0.3)",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgRef.current.width * zoom}px ${imgRef.current.height * zoom}px`,
            backgroundPositionX: `${-x * zoom + magnifierSize / 2}px`,
            backgroundPositionY: `${-y * zoom + magnifierSize / 2}px`,
            top: `${y - magnifierSize / 2}px`,
            left: `${x - magnifierSize / 2}px`,
          }}
        />
      )}
    </div>
  );
}
