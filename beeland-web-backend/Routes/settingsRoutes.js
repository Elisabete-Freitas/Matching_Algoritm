const express = require("express");
const router = express.Router();

const CropInfo = require("../Models/CropInfo");


router.get('/hives-per-culture', async (req, res) => {
    try {
        const entries = await CropInfo.find();
        res.json(entries);
    } catch (error) {
        console.error("Failed to fetch crop information:", error);
        res.status(500).send("Error fetching crop information.");
    }
});

// Rota para buscar informações de uma cultura específica
router.get('/crop-data/:cropType', async (req, res) => {
    const { cropType } = req.params; // Obtém o tipo de cultura a partir dos parâmetros da URL

    try {
        const cropData = await CropInfo.findOne({ cropType: cropType }); // Busca o tipo específico
        if (!cropData) {
            return res.status(404).json({ error: 'Cultura não encontrada' });
        }
        res.json(cropData);
    } catch (error) {
        console.error("Erro ao buscar informações da cultura:", error);
        res.status(500).send("Erro ao buscar informações da cultura.");
    }
});

router.post('/hives-per-culture', async (req, res) => {
    const { cropType, area, beehivesNeeded, startDate, endDate } = req.body;

    console.log(cropType, area, beehivesNeeded, startDate, endDate);

    if (!cropType ||!area ||!beehivesNeeded ||!startDate ||!endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
      const newCropInfo = new CropInfo({
        cropType: cropType,
        farmArea: parseInt(area),
        beehivesNeededPerHectare: parseInt(beehivesNeeded),
        pollinationStart: new Date(startDate),
        pollinationEnd: new Date(endDate)
      });
      await newCropInfo.save();
      res.status(201).json(newCropInfo);
    } catch (error) {
      console.error("Failed to create new crop info:", error);
      res.status(500).send("Failed to process request.");
    }
  });

router.patch('/hives-per-culture/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedEntry = await CropInfo.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEntry) {
            return res.status(404).send("CropInfo not found.");
        }
        res.json(updatedEntry);
    } catch (error) {
        console.error("Failed to update crop information:", error);
        res.status(500).send("Error updating crop information.");
    }
});

router.delete('/hives-per-culture/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEntry = await CropInfo.findByIdAndDelete(id);
        if (!deletedEntry) {
            return res.status(404).send("CropInfo not found.");
        }
        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error("Failed to delete crop information:", error);
        res.status(500).send("Error deleting crop information.");
    }
});

module.exports = router;
