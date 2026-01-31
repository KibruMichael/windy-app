import { Wind, Thermometer, CloudRain, Cloud, Radar, Waves, MoreHorizontal } from 'lucide-react';
import type { WeatherLayer } from '@/types/weather';

interface LayerSelectorProps {
  activeLayer: WeatherLayer;
  onLayerChange: (layer: WeatherLayer) => void;
}

const layers: { id: WeatherLayer; label: string; icon: React.ElementType }[] = [
  { id: 'wind', label: 'Wind', icon: Wind },
  { id: 'temp', label: 'Temp', icon: Thermometer },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'clouds', label: 'Clouds', icon: Cloud },
  { id: 'radar', label: 'Radar', icon: Radar },
  { id: 'waves', label: 'Waves', icon: Waves },
];

const LayerSelector = ({ activeLayer, onLayerChange }: LayerSelectorProps) => {
  return (
    <div className="glass-panel rounded-2xl p-3 flex items-center gap-2">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayer === layer.id;
        
        return (
          <button
            key={layer.id}
            onClick={() => onLayerChange(isActive ? 'none' : layer.id)}
            className={`layer-btn flex items-center gap-2 ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4" />
            <span>{layer.label}</span>
          </button>
        );
      })}
      
      <button className="layer-btn flex items-center gap-2">
        <MoreHorizontal className="w-4 h-4" />
        <span>More</span>
      </button>
    </div>
  );
};

export default LayerSelector;
