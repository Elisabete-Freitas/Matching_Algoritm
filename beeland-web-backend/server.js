const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require("cors");
require('dotenv').config();

const { verifiyToken } = require('./Middleware/MiddlewareSecure');

const app = express();

const PORT = process.env.PORT; 
const LOCALHOST = process.env.LOCALHOST

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});

const db = mongoose.connection;
app.use(bodyParser.json());
var corsOptions = { origin: `http://${LOCALHOST}` };
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, corsOptions }));

db.on('error', (error) => {
  console.error('\nMongoDB connection error:', error);
});

db.once('open', () => {
  console.log('\nBeeland(MongoDB Cluster) - connected');
});

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

const authRoutes = require("./Routes/authRoutes")
app.use("/beeland-api/authentication", authRoutes);

const userRoutes = require('./Routes/userRoutes');
app.use("/beeland-api/user", userRoutes);

const beekeeperRoutes = require('./Routes/beekeeperRoutes');
app.use("/beeland-api/beekeeper", beekeeperRoutes);

const farmerRoutes = require('./Routes/farmerRoutes');
app.use("/beeland-api/farmer", farmerRoutes);

const serviceRequestRoutes = require('./Routes/serviceRequestRoutes');
app.use("/beeland-api/service-request", serviceRequestRoutes);

const settingsRoutes = require('./Routes/settingsRoutes');
app.use("/beeland-api/settings", settingsRoutes);

const messageRoutes = require('./Routes/messageRoutes');
app.use("/beeland-api/messages", messageRoutes);

// TESTE API route
app.get('/beeland-api/hello', (req, res) => {
  res.json({ message: 'Beeland API - Running!' });
});

app.listen(PORT, () => {
  console.log(`Beeland(Server) - running - port ${PORT}`);
});
