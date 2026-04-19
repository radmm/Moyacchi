import { SkyData } from "../types";

async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(id);
  return response;
}

export async function searchLocation(query: string): Promise<{ lat: number, lon: number, name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const parts = [result.name];
      if (result.admin1) parts.push(result.admin1);
      if (result.country) parts.push(result.country);
      
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: parts.join(", ")
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding Error:", error);
    return null;
  }
}

export async function fetchSkyData(lat?: number, lon?: number, locationName?: string): Promise<SkyData> {
  // Default to Singapore
  const latitude = lat ?? 1.3521;
  const longitude = lon ?? 103.8198;

  try {
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5`;
    const pollenUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=alnus_pollen,betula_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;

    const aqiResponse = await fetchWithTimeout(aqiUrl);
    if (!aqiResponse.ok) {
      const errData = await aqiResponse.json().catch(() => ({}));
      throw new Error(`AQI API failed: ${errData.reason || aqiResponse.statusText}`);
    }
    
    const aqiData = await aqiResponse.json();
    const current = aqiData.current;

    // Try to fetch pollen data (this is optional as many regions don't have it)
    let pollen = { grass: 0, tree: 0, weed: 0 };
    try {
      const pResponse = await fetchWithTimeout(pollenUrl, 5000); 
      if (pResponse.ok) {
        const pData = await pResponse.json();
        const hourIdx = new Date().getHours();
        pollen = {
          grass: pData.hourly.grass_pollen?.[hourIdx] || 0,
          tree: (pData.hourly.alnus_pollen?.[hourIdx] || 0) + (pData.hourly.betula_pollen?.[hourIdx] || 0),
          weed: (pData.hourly.mugwort_pollen?.[hourIdx] || 0) + (pData.hourly.ragweed_pollen?.[hourIdx] || 0),
        };
      }
    } catch (e) {
      console.warn("Pollen data unavailable for this region");
    }

    // US AQI mapping (0-500 scale)
    let aqiLabel = "Good";
    const aqi = current.us_aqi;
    if (aqi > 50) aqiLabel = "Moderate";
    if (aqi > 100) aqiLabel = "Unhealthy for Sensitive Groups";
    if (aqi > 150) aqiLabel = "Unhealthy";
    if (aqi > 200) aqiLabel = "Very Unhealthy";
    if (aqi > 300) aqiLabel = "Hazardous";

    return {
      aqi,
      aqiLabel,
      pollutants: {
        pm25: current.pm2_5,
        pm10: current.pm10,
        o3: 0,
      },
      pollen,
      location: locationName || (lat ? "Current Location" : "Singapore (Local)"),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Sky Fetch Error:", error);
    // Provide dummy but valid data as ultimate fallback to prevent UI crash
    return {
      aqi: 25,
      aqiLabel: "Good",
      pollutants: { pm25: 12, pm10: 20, o3: 0 },
      pollen: { grass: 0, tree: 0, weed: 0 },
      location: "Offline Mode",
      timestamp: Date.now()
    };
  }
}
