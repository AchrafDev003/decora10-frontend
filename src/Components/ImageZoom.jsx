import { useState } from "react";

export default function ImageZoom({ src, alt }) {
  const [zoomStyle, setZoomStyle] = useState({ backgroundImage: `url(${src})` });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      backgroundImage: `url(${src})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "200%", // tamaño del zoom (puedes ajustarlo)
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ backgroundImage: `url(${src})`, backgroundPosition: "center", backgroundSize: "contain" });
  };

  return (
    <div
      className="image-zoom-wrapper"
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "zoom-in",
        backgroundImage: `url(${src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        transition: "background-size 0.3s, background-position 0.1s",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
