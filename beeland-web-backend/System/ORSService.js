const axios = require("axios");




// Função para obter a rota via Google Directions API
async function getDrivingDistanceGoogle(startLat, startLon, endLat, endLon) {
  const url = `https://maps.googleapis.com/maps/api/directions/json`;

  try {
    const response = await axios.get(url, {
      params: {
        origin: `${startLat},${startLon}`,
        destination: `${endLat},${endLon}`,
        key: GOOGLE_API_KEY,
      },
    });

    const data = response.data;

    if (data.status !== "OK") {
      console.error("Erro da Google API:", data.status, data.error_message);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Extrair nomes de estradas a partir dos steps
    const estradasUsadas = leg.steps
      .map(step => step.html_instructions.replace(/<[^>]+>/g, '').trim()) 
      .filter(name => name !== "");

    return {
      distance: leg.distance.value, 
      duration: leg.duration.value, 
      estradasUsadas: [...new Set(estradasUsadas)], 
    };
  } catch (error) {
    console.error("Erro ao chamar a Google Directions API:", error.message);
    return null;
  }
}

module.exports = { getDrivingDistanceGoogle };
