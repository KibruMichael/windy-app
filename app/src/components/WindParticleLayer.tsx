import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { WindParticle } from '@/types/weather';

interface WindParticleLayerProps {
  isActive: boolean;
  windSpeed?: number;
  windDeg?: number;
}

const WindParticleLayer = ({ isActive, windSpeed = 10, windDeg = 0 }: WindParticleLayerProps) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<WindParticle[]>([]);
  const animationRef = useRef<number>(0);
  const layerRef = useRef<L.Layer | null>(null);

  const PARTICLE_COUNT = 1500;
  const MAX_SPEED = 8;

  const initParticles = useCallback((width: number, height: number) => {
    const particles: WindParticle[] = [];
    const baseAngle = (windDeg * Math.PI) / 180;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const speedVariation = 0.5 + Math.random() * 0.8;
      const angleVariation = (Math.random() - 0.5) * 0.3;
      const angle = baseAngle + angleVariation;
      
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * (windSpeed / 10) * MAX_SPEED * speedVariation,
        vy: Math.sin(angle) * (windSpeed / 10) * MAX_SPEED * speedVariation,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 60,
        speed: (windSpeed / 10) * MAX_SPEED * speedVariation
      });
    }
    
    return particles;
  }, [windSpeed, windDeg]);

  const updateParticles = useCallback((width: number, height: number) => {
    const particles = particlesRef.current;
    const baseAngle = (windDeg * Math.PI) / 180;
    
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Reset particle if out of bounds or life ended
      const margin = 50;
      const shouldReset = 
        particle.life >= particle.maxLife ||
        particle.x < -margin ||
        particle.x > width + margin ||
        particle.y < -margin ||
        particle.y > height + margin;

      if (shouldReset) {
        // Respawn on the opposite side
        const spawnOnLeft = Math.cos(baseAngle) > 0;
        const spawnOnTop = Math.sin(baseAngle) > 0;
        
        if (Math.abs(Math.cos(baseAngle)) > Math.abs(Math.sin(baseAngle))) {
          particle.x = spawnOnLeft ? -margin : width + margin;
          particle.y = Math.random() * height;
        } else {
          particle.x = Math.random() * width;
          particle.y = spawnOnTop ? -margin : height + margin;
        }
        
        const speedVariation = 0.5 + Math.random() * 0.8;
        const angleVariation = (Math.random() - 0.5) * 0.3;
        const angle = baseAngle + angleVariation;
        
        particle.vx = Math.cos(angle) * (windSpeed / 10) * MAX_SPEED * speedVariation;
        particle.vy = Math.sin(angle) * (windSpeed / 10) * MAX_SPEED * speedVariation;
        particle.life = 0;
        particle.maxLife = 80 + Math.random() * 60;
        particle.speed = (windSpeed / 10) * MAX_SPEED * speedVariation;
      }
    });
  }, [windSpeed, windDeg]);

  const drawParticles = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(7, 11, 20, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    
    particles.forEach((particle) => {
      const lifeRatio = particle.life / particle.maxLife;
      const opacity = Math.sin(lifeRatio * Math.PI) * 0.6;
      
      // Draw particle tail
      const tailLength = Math.min(particle.speed * 3, 20);
      const tailX = particle.x - particle.vx * tailLength / particle.speed;
      const tailY = particle.y - particle.vy * tailLength / particle.speed;
      
      const gradient = ctx.createLinearGradient(tailX, tailY, particle.x, particle.y);
      gradient.addColorStop(0, `rgba(0, 240, 255, 0)`);
      gradient.addColorStop(1, `rgba(0, 240, 255, ${opacity})`);
      
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(particle.x, particle.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Draw particle head
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      ctx.fill();
    });
  }, []);

  const animate = useCallback(() => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    updateParticles(canvas.width, canvas.height);
    drawParticles();
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, updateParticles, drawParticles]);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    // Create canvas layer
    const CanvasLayer = L.Layer.extend({
      onAdd: function() {
        const size = map.getSize();
        const canvas = L.DomUtil.create('canvas', 'wind-canvas-layer');
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '400';
        
        this._canvas = canvas;
        this.getPane().appendChild(canvas);
        
        canvasRef.current = canvas;
        ctxRef.current = canvas.getContext('2d');
        
        // Initialize particles
        particlesRef.current = initParticles(size.x, size.y);
        
        // Start animation
        animate();
      },
      
      onRemove: function() {
        if (this._canvas) {
          L.DomUtil.remove(this._canvas);
        }
      }
    });

    const layer = new CanvasLayer();
    layer.addTo(map);
    layerRef.current = layer;

    // Handle map resize
    const handleResize = () => {
      const size = map.getSize();
      if (canvasRef.current) {
        canvasRef.current.width = size.x;
        canvasRef.current.height = size.y;
        particlesRef.current = initParticles(size.x, size.y);
      }
    };

    map.on('resize', handleResize);

    return () => {
      map.off('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [isActive, map, initParticles, animate]);

  // Update particle velocities when wind changes
  useEffect(() => {
    if (!isActive) return;
    
    const baseAngle = (windDeg * Math.PI) / 180;
    particlesRef.current.forEach((particle) => {
      const speedVariation = 0.5 + Math.random() * 0.8;
      const angleVariation = (Math.random() - 0.5) * 0.3;
      const angle = baseAngle + angleVariation;
      
      particle.vx = Math.cos(angle) * (windSpeed / 10) * MAX_SPEED * speedVariation;
      particle.vy = Math.sin(angle) * (windSpeed / 10) * MAX_SPEED * speedVariation;
      particle.speed = (windSpeed / 10) * MAX_SPEED * speedVariation;
    });
  }, [windSpeed, windDeg, isActive]);

  return null;
};

export default WindParticleLayer;
