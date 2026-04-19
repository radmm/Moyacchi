import { SkyData } from "../types";

export async function fetchSkyData(lat?: number, lon?: number): Promise<SkyData> {
  // Default to Singapore if coordinates not provided
  const latitude = lat ?? 1.3521;
  const longitude = lon ?? 103.8198;

  try {
    // Open-Meteo Air Quality API (Free, no key)
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,alnus_pollen,betula_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API failed");
    
    const data = await response.json();
    const current = data.current;

    // European AQI mapping
    let aqiLabel = "Good";
    const aqi = current.european_aqi;
    if (aqi > 20) aqiLabel = "Fair";
    if (aqi > 40) aqiLabel = "Moderate";
    if (aqi > 60) aqiLabel = "Poor";
    if (aqi > 80) aqiLabel = "Very Poor";
    if (aqi > 100) aqiLabel = "Extremely Poor";

    // Pollen average
    const pollen = {
      grass: current.grass_pollen || 0,
      tree: (current.alnus_pollen || 0) + (current.betula_pollen || 0),
      weed: (current.mugwort_pollen || 0) + (current.ragweed_pollen || 0),
    };

    return {
      aqi,
      aqiLabel,
      pollutants: {
        pm25: current.pm2_5,
        pm10: current.pm10,
        o3: 0, // Not provided by this simple call or not available
      },
      pollen,
      location: lat ? "Your Location" : "Local City",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Sky Fetch Error:", error);
    throw error;
  }
}
