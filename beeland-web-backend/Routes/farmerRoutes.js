const express = require("express");
const router = express.Router();
const User = require("../Models/User");

router.get("/all", async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" }).populate("farmer");
    res.json(farmers);
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Obter usuários com `account_status === false`
router.get("/desactive", async (req, res) => {
  try {
    console.log("Fetching inactive users..."); // Ajustado para refletir a lógica correta

    // Procurar usuários com account_status === false (inativos)
    const inactiveUsers = await User.find({ account_status: false });

    console.log("Inactive users found:", inactiveUsers);

    // Caso nenhum usuário inativo seja encontrado
    if (inactiveUsers.length === 0) {
      return res.status(404).json({ message: "No inactive users found" });
    }

    // Retorna os usuários inativos encontrados
    res.json(inactiveUsers);
  } catch (error) {
    console.error("Error fetching inactive users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/active", async (req, res) => {
  try {
    console.log("Fetching active users...");
    // Use true como boolean, e não como string
    const activeUsers = await User.find({ account_status: true });
    console.log("Active users found:", activeUsers);
    if (activeUsers.length === 0) {
      return res.status(404).send("No active users found");
    }
    res.json(activeUsers);
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).send("Internal Server Error");
  }
});






module.exports = router;