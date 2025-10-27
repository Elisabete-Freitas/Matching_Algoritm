const express = require("express");
const router = express.Router();
const { systemUserId } = require("../System/config");
const {sendNotification} = require("../Services/onesignalService")
const User = require("../Models/User");
const Farmer = require("../Models/Farmer");
const Beekeeper = require("../Models/Beekeeper");
const Message = require("../Models/Message");
const ServiceRequest = require("../Models/ServiceRequest");
const CropInfo = require("../Models/CropInfo");
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");

if (!systemUserId) {
    console.error('System User ID is not set in environment variables.');
    process.exit(1); 
}

router.get('/crops', async (req, res) => {
    try {
        const crops = await CropInfo.find();
        res.status(200).json(crops);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar dados.', error: err });
    }
});


router.get('/crops/:cropType', async (req, res) => {
    try {
        const crop = await CropInfo.findOne({ cropType: req.params.cropType });
        if (!crop) {
            return res.status(404).json({ message: 'Cultura não encontrada.' });
        }
        res.status(200).json(crop);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar dados.', error: err });
    }
});


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.GMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

router.post("/create-new", async (req, res) => {
    const { farmerId, beekeeperId, cropType, farmArea, startDate, endDate, pollinationStart, pollinationEnd } = req.body;

    if (!farmerId || !beekeeperId || !cropType || !farmArea || !startDate || !endDate || !pollinationStart || !pollinationEnd) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
        if (new Date(pollinationStart) >= new Date(pollinationEnd)) {
            return res.status(400).json({ message: "A data de início da polinização deve ser anterior à data de fim." });
        }

        if (new Date(startDate) < new Date(pollinationStart) || new Date(endDate) > new Date(pollinationEnd)) {
            return res.status(400).json({ message: "As datas de início e de fim devem estar dentro do intervalo de polinização especificado." });
        }

        const cropInfo = await CropInfo.findOne({ cropType: cropType });
        if (!cropInfo) {
            return res.status(404).json({ message: "Informações sobre a cultura não encontradas para o tipo de cultura fornecido." });
        }

        const numberOfHivesNeeded = Math.ceil(cropInfo.beehivesNeededPerHectare * farmArea);

        const newRequest = new ServiceRequest({
            farmer: farmerId,
            beekeeper: beekeeperId,
            cropType: cropType,
            farmArea: farmArea,
            numberOfHivesNeeded: numberOfHivesNeeded,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            pollinationStart: new Date(pollinationStart),
            pollinationEnd: new Date(pollinationEnd),
            status: "pending",
        });

        await newRequest.save();

        const messageToFarmer = new Message({
            sender: systemUserId,
            recipient: farmerId,
            content: `O seu pedido de serviço de polinização para ${cropType} está pendente de aceitação.`,
            serviceRequest: newRequest._id,
            status: "sent",
        });

        const messageToBeekeeper = new Message({
            sender: systemUserId,
            recipient: beekeeperId,
            content: `Novo pedido de serviço de polinização para ${cropType} disponível.`,
            serviceRequest: newRequest._id,
            status: "sent",
        });

        await messageToFarmer.save();
        await messageToBeekeeper.save();

     
        const tagKey = 'beekeeper';
        const tagValue = beekeeperId;
        await sendNotification(
            tagKey,
            tagValue,
            `Novo pedido de serviço de polinização para ${cropType} disponível.`
        );

       
        const beekeeper = await User.findById(beekeeperId);
        if (beekeeper && beekeeper.email) {
            await transporter.sendMail({
                from: '"Beeland" <no-reply@beeland.com>',
                to: beekeeper.email,
                subject: "Novo pedido de serviço de polinização",
                text: `Olá ${beekeeper.name}, tem um novo pedido de polinização para ${cropType}.`,
            html: `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <img src="cid:beelandlogo" style="width:150px; margin-bottom: 20px;" />
    <p>Olá <b>${beekeeper.name}</b>,</p>
    <p>Recebeu um novo pedido de polinização para <b>${cropType}</b>.</p>
    <p><b>Área:</b> ${farmArea} ha</p>
    <p><b>Período:</b> ${new Date(startDate).toLocaleDateString()} até ${new Date(endDate).toLocaleDateString()}</p>
<p>Por favor <a href="https://app.bee-land.pt/" target="_blank">aceda à plataforma</a> para mais detalhes.</p>
  </div>
`,
attachments: [
  {
    filename: "beeland-logo.png",
    path: "./Services/beeland-logo.png", 
    cid: "beelandlogo",                 
  },
],

            });
        }

        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Falha ao criar pedido de serviço:", error);
        res.status(500).send("Erro ao processar o pedido de serviço.");
    }
});


// Fetch ongoing service requests for a beekeeper
router.get("/ongoing/:beekeeperId", async (req, res) => {
    const { beekeeperId } = req.params;
    try {
        const ongoingRequests = await ServiceRequest.find({ beekeeper: beekeeperId, status: "accepted" })
            .populate('farmer', 'name lastname locality');
        res.json(ongoingRequests);
    } catch (error) {
        console.error("Falha ao buscar pedidos em andamento:", error);
        res.status(500).send("Erro ao buscar pedidos em andamento.");
    }
});

router.get("/pollinations-per-month/:beekeeperId", async (req, res) => {
    const { beekeeperId } = req.params;
  
    try {
        const pollinationsPerMonth = await ServiceRequest.aggregate([
            {
                $match: {
                    beekeeper: new mongoose.Types.ObjectId(beekeeperId),
                    status: "accepted"
                }
            },
            {
                $group: {
                    _id: { $month: "$startDate" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 } 
            }
        ]);
  
        // Formatar os resultados para incluir todos os meses do ano
        const formattedResults = Array(12).fill(0).map((_, index) => {
            const monthData = pollinationsPerMonth.find(data => data._id === index + 1);
            return monthData ? monthData.count : 0;
        });
  
        res.json({ pollinationsPerMonth: formattedResults });
    } catch (error) {
        console.error("Failed to retrieve pollinations per month:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/all-requests-farmer/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
        // Encontre todos os ServiceRequests associados ao userId
        const serviceRequests = await ServiceRequest.find({ farmer: new mongoose.Types.ObjectId(userId) });

        res.json({ serviceRequests });
    } catch (error) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/all-requests-beekeeper/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
        // Encontre todos os ServiceRequests associados ao userId
        const serviceRequests = await ServiceRequest.find({ beekeeper: new mongoose.Types.ObjectId(userId) });

        res.json({ serviceRequests });
    } catch (error) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Fetch pending service requests for a beekeeper
router.get("/pending/:beekeeperId", async (req, res) => {
    const { beekeeperId } = req.params;
    try {
        const pendingRequests = await ServiceRequest.find({ beekeeper: beekeeperId, status: "pending" })
            .populate('farmer', 'name lastname locality');
        res.json(pendingRequests);
    } catch (error) {
        console.error("Falha ao buscar pedidos pendentes:", error);
        res.status(500).send("Erro ao buscar pedidos pendentes.");
    }
});

// Update the status of a service request (accept or reject)
router.patch("/:requestId", async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
    }

    try {
        const serviceRequest = await ServiceRequest.findById(requestId).populate('beekeeper').populate('farmer');
        if (!serviceRequest) {
            return res.status(404).json({ message: "Pedido de serviço não encontrado." });
        }

        console.log("serviceRequest", serviceRequest)

        if (!serviceRequest.beekeeper) {
            return res.status(400).json({ message: "Nenhum apicultor associado a este pedido de serviço." });
        }

        //console.log("serviceRequest.beekeeper", serviceRequest.beekeeper)

        const beekeeperUser = await User.findById(serviceRequest.beekeeper).populate('beekeeper');
        if (!beekeeperUser || !beekeeperUser.beekeeper) {
            return res.status(404).json({ message: "Apicultor não encontrado." });
        }

        const farmerUser = await User.findById(serviceRequest.farmer).populate('farmer');
        if (!farmerUser || !farmerUser.farmer) {
            return res.status(404).json({ message: "Apicultor não encontrado." });
        }

        const beekeeper = beekeeperUser.beekeeper;
        const previousStatus = serviceRequest.status;
        serviceRequest.status = status;

        if (status === "accepted" && previousStatus !== "accepted") {
            await Beekeeper.findByIdAndUpdate(
                beekeeper._id,
                { $inc: { hivesReserved: serviceRequest.numberOfHivesNeeded } }
            );
            sendNotification(
                'beekeeper',
                serviceRequest.beekeeper._id,
                `O seu pedido de serviço de polinização para ${serviceRequest.cropType} foi aceite.`
            );
        } else if (status === "rejected") {
            sendNotification(
                'farmer',
                serviceRequest.farmer._id,
                `O seu pedido de serviço de polinização para ${serviceRequest.cropType} foi rejeitado.`
            );
        }

        await serviceRequest.save();

        const notificationMessage = status === "accepted"
            ? `O seu pedido de serviço de polinização para ${serviceRequest.cropType} foi aceite.`
            : `O seu pedido de serviço de polinização para ${serviceRequest.cropType} foi rejeitado.`;

        const messageToFarmer = new Message({
            sender: systemUserId,
            recipient: serviceRequest.farmer,
            content: notificationMessage,
            serviceRequest: serviceRequest._id,
            status: "sent"
        });

        await messageToFarmer.save();

        res.status(200).json(serviceRequest);
    } catch (error) {
        console.error("Falha ao atualizar pedido de serviço:", error);
        res.status(500).send("Erro ao atualizar pedido de serviço.");
    }
});


module.exports = router;
