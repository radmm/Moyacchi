import { SkyData } from "../types";

export async function searchLocation(query: string): Promise<{ lat: number, lon: number, name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: `${result.name}, ${result.country}`
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
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5`;
    const pollenUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=alnus_pollen,betula_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;

    const aqiResponse = await fetch(aqiUrl);
    if (!aqiResponse.ok) {
      const errData = await aqiResponse.json().catch(() => ({}));
      throw new Error(`AQI API failed: ${errData.reason || aqiResponse.statusText}`);
    }
    
    const aqiData = await aqiResponse.json();
    const current = aqiData.current;

    // Try to fetch pollen data (this is optional as many regions don't have it)
    let pollen = { grass: 0, tree: 0, weed: 0 };
    try {
      const pResponse = await fetch(pollenUrl);
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

    // European AQI mapping
    let aqiLabel = "Good";
    const aqi = current.european_aqi;
    if (aqi > 20) aqiLabel = "Fair";
    if (aqi > 40) aqiLabel = "Moderate";
    if (aqi > 60) aqiLabel = "Poor";
    if (aqi > 80) aqiLabel = "Very Poor";
    if (aqi > 100) aqiLabel = "Extremely Poor";

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
      aqiLabel: "Fair",
      pollutants: { pm25: 12, pm10: 20, o3: 0 },
      pollen: { grass: 0, tree: 0, weed: 0 },
      location: "Offline Mode",
      timestamp: Date.now()
    };
  }
}
