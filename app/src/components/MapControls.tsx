import { Plus, Minus, Locate, Globe } from 'lucide-react';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
  onLocate: () => void;
  is3D: boolean;
  onToggle3D: () => void;
}

const MapControls = ({ onLocate, is3D, onToggle3D }: MapControlsProps) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <button 
          onClick={handleZoomIn}
          className="map-control-btn w-full border-b border-white/10"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="map-control-btn w-full"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Locate Button */}
      <button 
        onClick={onLocate}
        className="map-control-btn glass-panel"
        aria-label="Locate me"
      >
        <Locate className="w-5 h-5" />
      </button>

      {/* 2D/3D Toggle */}
      <button 
        onClick={onToggle3D}
        className={`map-control-btn glass-panel ${is3D ? 'text-[#00F0FF] border-[#00F0FF]/40' : ''}`}
        aria-label="Toggle 3D view"
      >
        <Globe className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MapControls;
