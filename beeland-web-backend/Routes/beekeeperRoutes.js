const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const Beekeeper = require("../Models/Beekeeper");
const Farmer = require("../Models/Farmer");
const Message = require("../Models/Message");
const { calculateDistance } = require("../System/Formulas");
const { getDrivingDistanceGoogle } = require("../System/ORSService");
const ServiceRequest = require("../Models/ServiceRequest"); // ajusta o path se necessário


const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const stats = await Beekeeper.aggregate([
      {
        $group: {
          _id: null,
          totalBeekeepers: { $sum: 1 },
          totalHives: { $sum: "$hiveCount" },
          totalReservedHives: { $sum: "$hivesReserved" },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.status(404).json({ message: "No beekeepers found" });
    }

    const totalAvailableHives =
      stats[0].totalHives - stats[0].totalReservedHives;

    res.json({
      totalBeekeepers: stats[0].totalBeekeepers,
      totalHives: stats[0].totalHives,
      totalReservedHives: stats[0].totalReservedHives,
      totalAvailableHives: totalAvailableHives,
    });
  } catch (error) {
    console.error("Failed to retrieve beekeeper stats:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/all", async (req, res) => {
  try {
    const beekeepers = await User.find({ role: "beekeeper" }).populate(
      "beekeeper"
    );
    res.json(beekeepers);
  } catch (error) {
    console.error("Error fetching beekeepers:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/nearest-beekeepers", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const { species } = req.query;

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).send("Latitude and longitude must be valid numbers");
  }

    const colmeiasNecessarias = parseInt(req.query.colmeiasNecessarias || "1", 10);

    let speciesArray = [];
    if (Array.isArray(species)) {
      speciesArray = species;
    } else if (typeof species === "string") {
      speciesArray = [species];
    }

      if (!lat || !lon) {
        return res.status(400).send("Latitude and longitude parameters are required");
      }

      try {
        const beekeepers = await User.find({ role: "beekeeper" })
          .populate("beekeeper")
          .exec();
  
        const distances = await Promise.all(
          beekeepers.map(async (bk) => {
            // primeiro, garantir que há perfil de beekeeper e serviceArea
            if (!bk.beekeeper || !bk.beekeeper.serviceArea) {
              console.log("Beekeeper sem 'serviceArea', retirado:", bk._id);
              return null;
            }
  
            // agora, aplicar filtro de espécies com segurança
            const matchesSpecies =
              Array.isArray(bk.beekeeper.species) &&
              bk.beekeeper.species.some((bkSp) =>
                speciesArray.some(
                  (agriSp) => bkSp.Type.toLowerCase() === agriSp.toLowerCase()
                )
              );
  
            if (!matchesSpecies) {
              console.log(
                `Apicultor ${bk._id} não atende a nenhuma das espécies: ${speciesArray.join(
                  ", "
                )}`
              );
              return null;
            }
  
            const result = await getDrivingDistanceGoogle(lat, lon, bk.lat, bk.long);
            if (!result) return null;
  
            const hivesDisponiveis =
              bk.beekeeper.hiveCount - bk.beekeeper.hivesReserved;
  
            if (hivesDisponiveis < colmeiasNecessarias) {
              console.log(
                `Beekeeper ${bk._id} com ${hivesDisponiveis} colmeias — insuficiente para ${colmeiasNecessarias}.`
              );
              return null;
            }
  
            if (result.distance > bk.beekeeper.serviceArea) {
              console.log("Fora da serviceArea:", bk._id);
              return null;
            }
  
            const completedRequestsCount = await ServiceRequest.countDocuments({
              beekeeper: bk._id,
              status: "completed",
            });
  
            const distanceKm = result.distance / 1000;
            const travelPrice = bk.beekeeper.travel_price ?? 0;
            const precoDeslocacao = travelPrice * distanceKm;
            const precoTotal = (bk.beekeeper.serviceRate ?? 0) + precoDeslocacao;
  
            return {
              ...bk._doc,
              distance: result.distance,
              duration: result.duration,
              distanceKm,
              durationMin: result.duration / 60,
              estradasUsadas: result.estradasUsadas,
              serviceArea: bk.beekeeper.serviceArea,
              hiveCount: bk.beekeeper.hiveCount,
              hivesReserved: bk.beekeeper.hivesReserved,
              hivesDisponiveis,
              serviceRate: bk.beekeeper.serviceRate,
              travelPrice,
              precoDeslocacao,
              precoTotal,
              experience: bk.beekeeper.experience ?? 0,
              beekeeper: bk.beekeeper,
              successfulRequests: completedRequestsCount,
            };
          })
        );
  
        const validDistances = distances.filter((bk) => bk !== null);
  
        if (validDistances.length === 0) {
          return res
            .status(404)
            .json({
              message:
                "Nenhum apicultor disponível com as condições solicitadas.",
            });
        }
  
        function calcularScores(beekeepers) {
          const minDist = Math.min(...beekeepers.map(bk => bk.distanceKm));
          const maxDist = Math.max(...beekeepers.map(bk => bk.distanceKm));
  
          const minPreco = Math.min(...beekeepers.map(bk => bk.precoTotal));
          const maxPreco = Math.max(...beekeepers.map(bk => bk.precoTotal));
  
          const minDuracao = Math.min(...beekeepers.map(bk => bk.durationMin));
          const maxDuracao = Math.max(...beekeepers.map(bk => bk.durationMin));
  
          const minSuccess = Math.min(...beekeepers.map(bk => bk.successfulRequests));
          const maxSuccess = Math.max(...beekeepers.map(bk => bk.successfulRequests));
  
          const minExperience = Math.min(...beekeepers.map(bk => bk.experience));
          const maxExperience = Math.max(...beekeepers.map(bk => bk.experience));
  
          return beekeepers.map(bk => {
            const distNorm = 1 - ((bk.distanceKm - minDist) / (maxDist - minDist || 1));
            const precoNorm = 1 - ((bk.precoTotal - minPreco) / (maxPreco - minPreco || 1));
            const duracaoNorm = 1 - ((bk.durationMin - minDuracao) / (maxDuracao - minDuracao || 1));
            const successNorm = (bk.successfulRequests - minSuccess) / (maxSuccess - minSuccess || 1);
            const experienceNorm = (bk.experience - minExperience) / (maxExperience - minExperience || 1);
  
         
            // distância: 30%
            // preço: 30%
            // duração: 15%
            // serviços concluídos: 10%
            // experiência: 15%
            const score = (distNorm * 0.30) +
                          (precoNorm * 0.30) +
                          (duracaoNorm * 0.20) +
                          (successNorm * 0.10) +
                          (experienceNorm * 0.10);
  
            console.log(`Apicultor ${bk._id}:`);
            console.log(`  Distância: ${bk.distanceKm.toFixed(2)} km (normalizado: ${distNorm.toFixed(2)})`);
            console.log(`  Preço total: €${bk.precoTotal.toFixed(2)} (normalizado: ${precoNorm.toFixed(2)})`);
            console.log(`  Duração: ${bk.durationMin.toFixed(2)} min (normalizado: ${duracaoNorm.toFixed(2)})`);
            console.log(`  Serviços concluídos: ${bk.successfulRequests} (normalizado: ${successNorm.toFixed(2)})`);
            console.log(`  Experiência: ${bk.experience} anos (normalizado: ${experienceNorm.toFixed(2)})`);
            console.log(`  ✅ Score final: ${score}\n`);
  
            return {
              ...bk,
              score: parseFloat(score.toFixed(3)),
            };
          });
        }
  
        const scoredBeekeepers = calcularScores(validDistances);
        const top3 = scoredBeekeepers
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
  
        res.json(top3);
        console.log("Top 3 apicultores recomendados:", top3);
      } catch (error) {
        console.log("Erro ao buscar apicultores:", error);
        res.status(500).send("Server error");
      }
});





module.exports = router;
