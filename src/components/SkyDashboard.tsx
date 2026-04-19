import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Wind, Droplets, MapPin, Loader2, ShieldCheck, Search, Navigation } from 'lucide-react';
import { fetchSkyData, searchLocation } from '../lib/skyService';
import { SkyData } from '../types';

export default function SkyDashboard() {
  const [data, setData] = useState<SkyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ lat: number, lon: number, name: string }[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setIsSearching(false);
      }, 15000); // 15 second safety cutoff
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const handleSelectLocation = async (loc: { lat: number, lon: number, name: string }) => {
    setIsLoading(true);
    setSearchResults([]);
    setSearchQuery('');
    try {
      const skyData = await fetchSkyData(loc.lat, loc.lon, loc.name);
      setData(skyData);
    } catch (err) {
      console.error(err);
      alert("Moyacchi is having trouble mapping that spot. Try again? ☁️");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const locations = await searchLocation(searchQuery);
      if (locations.length === 1) {
        handleSelectLocation(locations[0]);
      } else if (locations.length > 1) {
        setSearchResults(locations);
      } else {
        alert("Moyacchi couldn't find that place. Try another spelling? 🌍");
      }
    } catch (err) {
      console.error(err);
      alert("Sky service is resting. Please try again in a moment! ☁️");
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-8">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-text-main font-bold text-lg animate-pulse">Mapping your Sky...</p>
          <p className="text-text-dim text-xs uppercase tracking-widest">Bridging local air data</p>
        </div>
        <button 
          onClick={() => { setIsLoading(false); setIsSearching(false); }}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-glass-border text-xs text-text-dim hover:text-white transition-all"
        >
          Cancel & Try Manual
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-4xl mx-auto pb-20 pt-10 px-4"
    >
      <AnimatePresence mode="wait">
        {!data ? (
          <motion.div
            key="permission"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-12 text-center space-y-8 border-primary/20 bg-primary/2"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
              <Cloud className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Global Sky-Link</h3>
              <p className="text-sm text-text-dim max-w-xs mx-auto leading-relaxed">
                Connect your real-time environment by searching for your city. Moyacchi tracks worldwide air quality using the global US-EPA standard.
              </p>
            </div>
            
            <div className="flex flex-col gap-6 max-w-sm mx-auto">
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text"
                  placeholder="Enter city or region"
                  className="glass-input pr-12 text-center h-16 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
                >
                  {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[10px] text-text-dim uppercase tracking-[0.2em] mb-2 font-bold">Pick the right spot:</p>
                  {searchResults.map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full p-4 glass-card bg-white/5 hover:bg-white/10 text-left text-sm text-text-main flex items-center gap-3 transition-colors border-white/5"
                    >
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{loc.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-text-dim uppercase tracking-widest">Search worldwide. Start with your city.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-dim">Ozone (O3)</span>
                    <span className="text-sm font-bold text-white">{data.pollutants.o3} μg/m³</span>
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

            {/* Manual Fallback in Footer */}
            <div className="pt-10 flex flex-col items-center gap-6">
               <div className="h-[1px] w-full bg-white/5" />
               <div className="w-full max-w-sm">
                 <p className="text-[10px] text-text-dim uppercase tracking-widest mb-4 text-center">Change Location</p>
                 <form onSubmit={handleSearch} className="relative group">
                  <input 
                    type="text"
                    placeholder="Search city..."
                    className="glass-input pr-12 text-sm h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                  />
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-white transition-colors"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {searchResults.map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full p-3 glass-card bg-white/5 hover:bg-white/10 text-left text-xs text-text-main flex items-center gap-3 transition-colors border-white/5"
                      >
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
