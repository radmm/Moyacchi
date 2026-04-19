import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cloud, Wind, Droplets, MapPin, Loader2, Thermometer, ShieldCheck } from 'lucide-react';
import { fetchSkyData } from '../lib/skyService';
import { SkyData } from '../types';

export default function SkyDashboard() {
  const [data, setData] = useState<SkyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const skyData = await fetchSkyData(position.coords.latitude, position.coords.longitude);
              setData(skyData);
              setIsLoading(false);
            },
            async () => {
              // Fallback if denied
              const skyData = await fetchSkyData();
              setData(skyData);
              setIsLoading(false);
            }
          );
        } else {
          const skyData = await fetchSkyData();
          setData(skyData);
          setIsLoading(false);
        }
      } catch (err) {
        setError("Could not track the sky right now. Try again later.");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-text-dim text-sm uppercase tracking-widest animate-pulse">Scanning the Sky...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center p-10">
        <p className="text-text-dim">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-4xl mx-auto pb-10"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-4xl font-black text-white italic tracking-tight">Sky Status</h3>
          <div className="flex items-center gap-2 text-text-dim text-xs uppercase tracking-widest justify-center md:justify-start">
            <MapPin className="w-3 h-3 text-primary" />
            {data.location}
          </div>
        </div>

        <div className="flex flex-col items-center p-6 bg-white/5 rounded-[40px] border border-glass-border min-w-[200px]">
          <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2">Air Quality Index</span>
          <div className="text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(166,255,0,0.3)]">
            {Math.round(data.aqi)}
          </div>
          <span className="text-sm font-bold text-white mt-1 uppercase tracking-widest">{data.aqiLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pollutants Card */}
        <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Wind className="w-5 h-5" />
            <h4 className="text-xs font-black uppercase tracking-widest">Main Pollutants</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">PM2.5</span>
              <span className="text-sm font-bold text-white">{data.pollutants.pm25} μg/m³</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">PM10</span>
              <span className="text-sm font-bold text-white">{data.pollutants.pm10} μg/m³</span>
            </div>
          </div>
        </div>

        {/* Pollen Card */}
        <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-6 text-secondary">
            <Droplets className="w-5 h-5" />
            <h4 className="text-xs font-black uppercase tracking-widest">Pollen Tracker</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">Grass</span>
              <span className="text-sm font-bold text-white">{data.pollen.grass} grains</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">Tree</span>
              <span className="text-sm font-bold text-white">{data.pollen.tree} grains</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim">Weed</span>
              <span className="text-sm font-bold text-white">{data.pollen.weed} grains</span>
            </div>
          </div>
        </div>

        {/* Protection Tip */}
        <div className="glass-card p-6 border-primary/20 bg-primary/5 lg:col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-xs font-black uppercase tracking-widest">Protection Tip</h4>
          </div>
          <p className="text-sm text-text-main leading-relaxed italic">
            {data.aqi > 50 
              ? "The air is a bit dusty today. Consider wearing a mask or limiting outdoor activity if you have sensitivities. 😷"
              : "Great day for some fresh air! Open the windows or go for a brisk walk to boost your mood. 🍃"}
          </p>
        </div>
      </div>

      <div className="p-10 rounded-[32px] bg-white/2 border border-white/5 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-full">
            <Cloud className="w-8 h-8 text-secondary" />
          </div>
          <h4 className="text-xl font-bold text-white">Track the Invisible</h4>
          <p className="text-sm text-text-dim max-w-sm mx-auto">
            Understanding your environment is the first step to holistic sustainability. The Sky tracker connects your personal habits to the global ecosystem.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
