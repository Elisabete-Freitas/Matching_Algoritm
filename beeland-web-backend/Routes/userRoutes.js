const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const Beekeeper = require("../Models/Beekeeper");
const Farmer = require("../Models/Farmer");
const router = express.Router();


router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.role === "beekeeper") {
      const completeUserData = await User.findById(req.params.id).populate("beekeeper");
      res.json(completeUserData);  
    } else if (user.role === "farmer") {
      const completeUserData = await User.findById(req.params.id).populate("farmer");
      res.json(completeUserData); 
    } else {
      res.json(user);
    }

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});



router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    let completeUserData = user.toObject(); // Convert to plain object

    if (user.role === "beekeeper") {
        const beekeeperData = await User.findById(req.params.id).populate("beekeeper");
        completeUserData.beekeeper = beekeeperData.beekeeper;
    } else if (user.role === "farmer") {
        const farmerData = await User.findById(req.params.id).populate("farmer");
        completeUserData.farmer = farmerData.farmer;
    }

    res.json(completeUserData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/latlong/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
 
   res.json({lat: user.lat, long: user.long});

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/register/beekeeper", async (req, res) => {
  const {
    email,
    password,
    name,
    lastname,
    nif,
    phone,
    address,
    postalCode,
    locality,
    lat,
    long,
    
    serviceArea,
    hiveCount,
    serviceRate,
    account_status,
     experience,
  travel_price,
  species,
  } = req.body;

  try {
    const cleanedNif = nif?.toString().replace(/\s+/g, "");

if (!cleanedNif || isNaN(cleanedNif) || cleanedNif.length !== 9) {
  return res.status(400).json({
    message: "NIF inválido. Certifique-se de que contém exatamente 9 dígitos.",
  });
}

    const cleanedPhone = phone?.toString().replace(/\s+/g, "");

if (!cleanedPhone || isNaN(cleanedPhone)) {
  return res.status(400).json({
    message: "Número de telefone inválido. Certifique-se de que contém apenas dígitos.",
  });
}
 
    if (!email?.trim() || !password || !name?.trim() || !lastname?.trim() || !nif?.trim()) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }

    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Já existe um utilizador com este email." });
    }

    if (!lat || !long || lat.toString?.().trim() === "" || long.toString?.().trim() === "") {
      return res.status(400).json({ message: "Morada inserida incorretamente. Insira novamente." });
    }

    if (experience === undefined || isNaN(experience)) {
  return res.status(400).json({ message: "Experiência inválida." });
}

if (travel_price === undefined || isNaN(travel_price)) {
  return res.status(400).json({ message: "Preço de deslocação inválido." });
}

if (!Array.isArray(species) || species.length === 0 || !species.every(s => s.Type)) {
  return res.status(400).json({ message: "Espécies inválidas ou em falta." });
}
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({
      name: name.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      password: hashedPassword,
      nif: cleanedNif,
      phone: Number(cleanedPhone),
      address,
      postalCode,
      locality,
      role: "beekeeper",
      lat,
      long,
      account_status: true, 
    });

    const savedUser = await newUser.save();

    // Criação do documento Beekeeper associado ao utilizador
    const newBeekeeper = new Beekeeper({
      userId: savedUser._id,
      serviceArea,
      hiveCount,
      serviceRate,
      
  experience,
  travel_price,
  species
    });

    const savedBeekeeper = await newBeekeeper.save();

    // Atualiza o utilizador com a referência para o apicultor
    savedUser.beekeeper = savedBeekeeper._id;
    await savedUser.save();

    res.status(201).json({ message: "Registo de apicultor efetuado com sucesso!" });

  } catch (error) {
    console.error("Erro ao registar o apicultor:", error);
    res.status(500).json({
      message: "Erro interno do servidor. Tente novamente mais tarde. Para assistência, contacte: beeland.dop2023@gmail.com"
    });
  }
});

router.post("/register/farmer", async (req, res) => {
  const {
    email, password, name, lastname, nif, phone,
    address, postalCode, locality, lat, long,
    region, country, district, farmArea, crops, account_status
  } = req.body;

  try {
   

    const cleanedNif = nif?.toString().replace(/\s+/g, "");
    if (!cleanedNif || isNaN(cleanedNif) || cleanedNif.length !== 9) {
      return res.status(400).json({ message: "NIF inválido. Certifique-se de que contém exatamente 9 dígitos." });
    }
    const cleanedPhone = phone?.toString().replace(/\s+/g, "");
    if (!cleanedPhone || isNaN(cleanedPhone)) {
      return res.status(400).json({ message: "Número de telefone inválido. Certifique-se de que contém apenas dígitos." });
    }
    if (!email?.trim() || !password || !name?.trim() || !lastname?.trim() || !nif?.trim()) {
      return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
    }
    if (!lat || !long || lat.toString?.().trim() === "" || long.toString?.().trim() === "") {
      return res.status(400).json({ message: "Morada inserida incorretamente. Insira novamente." });
    }
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Já existe um utilizador com este email." });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newFarmer = new Farmer({
      farmArea,
      crops
    });
    await newFarmer.save();

   
    const newUser = new User({
      name: name.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      password: hashedPassword,
      nif: cleanedNif,
      phone: Number(cleanedPhone),
      address,
      postalCode,
      locality,
      role: "farmer",
      lat,
      long,
      region,
      country,
      district,
      farmer: newFarmer._id,
      account_status: true,
    });

    await newUser.save();

    res.status(201).json({ message: "Registo efetuado com sucesso!" });

  } catch (error) {
    console.error("Erro ao registar o agricultor:", error);
    res.status(500).json({
      message: "Erro interno do servidor. Tente novamente mais tarde. Para assistência, contacte: beeland.dop2023@gmail.com"
    });
  }
});



// Rota de atualização para usuário, beekeeper e farmer
router.put('/update/:userId', async (req, res) => {
  const { userId } = req.params;
  const id_farmer = req.body?.farmer?._id || []; 
  // Inicializa como array vazio se não for fornecido
  const id_beekeeper = req.body?.beekeeper?._id || []; 
 
  const {
    email,
    name,
    lastname,
    nif,
    phone,
    address,
    postalCode,
    locality,
    lat,
    long,
    region,
    country,
    district,
    serviceArea,
    hiveCount,
    serviceRate,
    farmArea,
    crops,
  } = req.body;

  try {
    // Encontrar o usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Atualizar campos comuns
    user.email = email || user.email;
    user.name = name || user.name;
    user.lastname = lastname || user.lastname;
    user.nif = nif || user.nif;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.postalCode = postalCode || user.postalCode;
    user.locality = locality || user.locality;
    user.lat = lat || user.lat;
    user.long = long || user.long;
    user.region = region || user.region;
    user.country = country || user.country;
    user.district = district || user.district;

    await user.save();

     // Atualizar campos específicos para beekeepers
     if (user.role === 'beekeeper') {
      const beekeeper = await Beekeeper.findById(user.beekeeper); // 🔹 Mudança aqui!
      
      if (!beekeeper) {
        return res.status(404).send("Beekeeper profile not found");
      }

      beekeeper.serviceArea = serviceArea !== undefined ? serviceArea : beekeeper.serviceArea;
      beekeeper.hiveCount = hiveCount !== undefined ? hiveCount : beekeeper.hiveCount;
      beekeeper.serviceRate = serviceRate !== undefined ? serviceRate : beekeeper.serviceRate;

      await beekeeper.save();
    }


    if (user.role === 'farmer') {
      const farmer = await Farmer.findById(user.farmer);

     
      if (!farmer) {
        return res.status(404).send("Farmer profile not found");
      }
  
      farmer.farmArea = farmArea !== undefined ? farmArea : farmer.farmArea;
      
        if (Array.isArray(crops)) {
          farmer.crops = crops; // Substitui o array inteiro de culturas
         
        }
      
        await farmer.save();
      }
    

    res.status(200).send('Utilizador atualizado com sucesso');
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).send(error.message);
  }
});


router.post('/onesignal-subscription-id', async (req, res) => {
  const { userId, subscriptionId } = req.body;

  if (!userId || !subscriptionId) {
      return res.status(400).json({ message: 'User ID and Subscription ID are required' });
  }

  try {
      await User.findByIdAndUpdate(userId, { oneSignalSubscriptionId: subscriptionId });
      res.status(200).json({ message: 'Subscription ID updated successfully' });
  } catch (error) {
      console.error('Error updating Subscription ID:', error);
      res.status(500).json({ message: 'Error updating Subscription ID' });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Encontrar o usuário
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Se o usuário for um Beekeeper, excluir o registro associado
    if (user.role === "beekeeper" && user.beekeeper) {
      await Beekeeper.findByIdAndDelete(user.beekeeper);
    }

    // Se o usuário for um Farmer, excluir o registro associado
    if (user.role === "farmer" && user.farmer) {
      await Farmer.findByIdAndDelete(user.farmer);
    }

    // Excluir o usuário
    await User.findByIdAndDelete(id);

    res.status(200).send("User deleted successfully!");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send(error.message);
  }
});

router.put("/activate-user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Encontrar o utilizador
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Atualizar o estado da conta para `true`
    user.account_status = true;
    await user.save();

    res.status(200).send("User activated successfully!");
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).send("Internal Server Error");
  }
});









module.exports = router;
