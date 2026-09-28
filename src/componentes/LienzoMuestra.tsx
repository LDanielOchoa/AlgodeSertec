import React from 'react';

interface LienzoMuestraProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const LienzoMuestra: React.FC<LienzoMuestraProps> = ({ canvasRef }) => {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
