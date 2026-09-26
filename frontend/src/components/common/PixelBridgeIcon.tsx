import React from "react";

export const PixelBridgeIcon = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <img
      src="/pixel_icon.jpg"
      alt="SceneSetu"
      className={`${className} object-contain rounded pixelated select-none`}
      style={{ imageRendering: "pixelated" }}
    />
  );
};
